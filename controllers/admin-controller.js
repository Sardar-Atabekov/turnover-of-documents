const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const User = require('../models/user');


exports.AdminLogin = async(req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name: name.trim() });

    if (user) {
      await bcryptjs.compare(password, user.password, (err, response) => {
        if (err) res.sendStatus(500);
        if (response) {
          jwt.sign({ user }, "secretkey", { expiresIn: '12h' }, (err, token) => {
            if (err) res.sendStatus(403);
            user.password = undefined;
            res.json({
              success: true,
              token,
              user
            });
          });
        } else {
          res.json({
            success: false,
            message: "Логин или пароль введены не верно"
          });
        }
      });
    } else {
      await res.json({
        success: false,
        message: "Логин или пароль введены не верно"
      });
    }
  } catch (error) {
    console.log(error)
    res.json([...error, ...req]);
  }
};

const createFold = (folderPath, success) => {
  fs.mkdirSync(process.cwd() + folderPath, { recursive: true }, err => {
    if (err) {
      console.log("Error", err)
    } else {
      success()
    }
  })
};

exports.createAdmin = async(req, res) => {

  jwt.verify(req.token, 'secretkey', async(err, authData) => {
    if (err) res.sendStatus(500);
    else {
      const { password, name, faculty, role } = req.body;
      const hashPassword = await bcryptjs.hash(password, 10);
      const candidate = await User.findOne({ name });

      if (candidate) {
        await res.json({
          success: false,
          message: "Кафедра с таким названием уже зарегистрирована"
        })
      } else {
        const NewUser = new User({
          name,
          faculty,
          role,
          password: hashPassword,
        });
        NewUser.save(err => {
          if (err) {
            console.log(err);
            res.json({
              success: false,
              message: "Пользователь не создан, убедитесь с правильности заполнения полей",
            });
          }
          createFold(`/uploads/${NewUser._id}`, res.json({
            success: true,
            message: "Пользователь создан",
          }));
        });
      }
    }
  });
};

exports.getAllAdmins = async(req, res) => {
  console.log("Query")
  jwt.verify(req.token, 'secretkey', async(err, data) => {
    if (err) res.sendStatus(403);
    else {
      let AllAdmins = await User.find({});
      await res.json({
        AllAdmins,
      })
    }
  });
};

exports.updateAdmin = async(req, res) => {
  console.log("Query")
  jwt.verify(req.token, "secretkey", async(err) => {
    if (err) res.sendStatus(403);
    const { id, password } = req.body;
    const hashPassword = await bcryptjs.hash(password, 10);

    User.updateOne({ _id: id }, {
      password: hashPassword,
    }, err => {
      if (err) res.sendStatus(500);
      else res.json({
        message: "Пароль успешно изменен"
      })
    })
  });
};

exports.deleteAdmin = async(req, res) => {
  console.log("Query")
  jwt.verify(req.token, "secretkey", async err => {
    const { id } = req.body;
    await User.deleteOne({ _id: id }, (err) => {
      if (err) res.sendStatus(500);
      else {
        res.json({
          message: "Кафедра успешно удалена"
        })
      }
    });
  });
};