const FileScheme = require('../models/file');
const jwt = require('jsonwebtoken');

exports.uploadFile = async(req, res) => {
  jwt.verify(req.token, "secretkey", async(err) => {
    if (err) res.sendStatus(403);
    else {
      const { filename, userId, allowToEdit, allowToRead, description } = req.body;
      const fileName = Date.now() + req.files.file.name;
      const filePath = `/uploads/${userId}/${fileName}`;
      const editUsers = JSON.parse(allowToEdit);
      const readUser = JSON.parse(allowToRead);
      editUsers.push({ user: userId });
      readUser.push({ user: userId });

      req.files.file.mv("." + filePath, (err) => {
        if (err) {
          res.json({
            success: false,
            message: "Что пошло не так",
            err
          })
        } else {
          const File = new FileScheme({
            createdBy: userId,
            versions: [{
              filename,
              src: fileName,
              dateOfCreation: new Date(),
              description
            }],
            allowToEdit: editUsers,
            allowToRead: readUser,
          });

          File.save(err => {
            if (err) {
              res.json({
                success: false,
                message: "Что пошло не так"
              })
            }
            res.json({
              success: true,
              message: "File uploaded!",
              File,
            })
          })
        }
      });
    }
  });
};

exports.getFilesOfUser = async(req, res) => {
  jwt.verify(req.token, "secretkey", async(err) => {
    if (err) res.sendStatus(403);
    const { id } = req.params;
    const { userId } = req.body;
    await FileScheme.find({ createdBy: id }, (err, data) => {
      if (err) {
        res.json({
          success: false,
          message: "Что пошло не так"
        })
      }
      console.log(data);
      data[0].allowToEdit = undefined;
      data[0].allowToRead.map(item => {
        if (item.user == userId) {
          data[0].allowToRead = undefined;
          res.json({
            data
          })
        } else {
          res.sendStatus(403);
        }
      });
    });
  })
};

exports.updateFileOfUser = async(req, res) => {

  jwt.verify(req.token, "secretkey", async(err) => {
    if (err) {
      console.log('Here');
      res.sendStatus(403);
    } else {
      const { id } = req.params;
      const { userId, filename, description, allowToEdit, allowToRead, } = req.body;
      // console.log(allowToEdit, allowToRead)
      const editUsers = allowToEdit ? JSON.parse(allowToEdit) : null;
      const readUser = allowToRead ? JSON.parse(allowToRead) : null;
      const fileName = Date.now() + req.files.file.name;
      const File = await FileScheme.findOne({ _id: id }, (err, data) => {
        if (err) {
          res.json({ success: false, message: "Файл не найден или попробуйте позже" });
        } else {
          return data;
        }
      });
      const filePath = `/uploads/${File.createdBy}/${fileName}`;

      File.allowToEdit.some(item => {
        if (item.user == userId) {
          console.log("Работает")
          req.files.file.mv("." + filePath, async err => {
            if (err) {
              res.json({
                success: false,
                message: "Проверьте правильность отправленных данных",
              })
            } else {
              await File.versions.push({
                filename,
                src: fileName,
                dateOfCreation: new Date(),
                description
              });
              File.allowToEdit.map(item => {
                item.opened = false;
                return item;
              });
              File.allowToRead.map(item => {
                item.opened = false;
                return item;
              });
              File.save(err => {
                if (err) {
                  res.json({
                    success: false,
                    message: "Что пошло не так"
                  })
                }
                File.allowToEdit = undefined;
                File.allowToRead = undefined;
                res.json({
                  success: true,
                  data: File
                })
              });
            }
          });
          return;
        }
      });
    }
  })
};


const getAllowDocuments = (queryString, id, res) => {
  FileScheme.find({
    [queryString]: id
  }, (err, data) => {
    try {
      if (err) {
        res.json({
          success: false,
          message: "Что пошло не так",
        })
      } else {
        if (data.length !== 0) {
          const mapdata = data.map((item, idx) => {
            item.allowToEdit = undefined;
            item.allowToRead = undefined;
            return item;
          });
          mapdata.req = req;
          res.json(mapdata)
        } else res.json({
          success: false,
          message: "Что пошло не так"
        })
      };
    } catch (e) {
      console.log(e);
    }
  })
};

exports.getAllowDocumentsToMe = async(req, res) => {
  const { editOrRead, id } = req.params;
  if (editOrRead === 'read') {
    getAllowDocuments("allowToRead.user", id, res);
  } else if (editOrRead === 'edit') {
    getAllowDocuments("allowToEdit.user", id, res)
  } else if (editOrRead === 'all') {
    FileScheme.find({
      $or: [{ "allowToEdit.user": id }, { "allowToRead.user": id }]
    }, (err, data) => {
      if (err) res.json({
        success: false,
        message: "Что-то пошло не так"
      })
      else {
        res.json(data);
      }
    })
  } else res.sendStatus(404);
};

exports.getOneFile = async(req, res) => {
  const { createdBy, src, userId } = req.params;
  FileScheme.findOne({
    "versions.src": src
  }).then(doc => {
    doc.allowToEdit.map(item => {
      if (item.user == userId) {
        item.opened = true;
        return item;
      }
    })
    doc.save();
    res.download(`./uploads/${createdBy}/${src}`);
  }).catch(e => {
    res.json({
      success: false,
      message: "Что-то пошло не так"
    })
  })
};

exports.getMyFiles = async(req, res) => {
  jwt.verify(req.token, "secretkey", async err => {
    if (err) res.sendStatus(403);
    else {
      const { id } = req.params;
      FileScheme.find({ createdBy: id }, (err, data) => {
        if (err) {
          res.json({
            success: false,
            message: "Что пошло не так"
          })
        } else {
          res.json({
            success: true,
            data
          })
        }
      });
    }
  })
};

exports.addToArchive = async (req,res) => {
  let {filesId} = req.body;

  filesId = JSON.parse(filesId);

  if(filesId.length > 0) {
    try {
      FileScheme.updateMany({_id: {$in: filesId}},{archive: false},(err,data) => {
        if(err) {
          res.json({
            success: false,
            message: "Что-то пошло не так"
          })
        }else {
          res.json(data)
        }
      })
    } catch (error) {
      res.json({
        success: false,
        message: "Что-то пошло не так"
      })
    }
  }else {
    res.json({
      success: false,
      message: "Убедитесь в правильности введенных данных"
    })
  }

};