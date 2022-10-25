const express = require('express')
const app = express()
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const bodyParser = require('body-parser');
const { response } = require('express') 
const { emit } = require('process')
const generateUniqueId = require('generate-unique-id');
 
 
//use express static folder
app.use(cors());
app.use(express.static("./public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
// Database connection
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "swiftcash"
})
 
con.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
const multerConfig = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, '../public/');
  },
  filename: function (req, file, callback) {
      const ext = file.mimetype.split('/')[1];
    callback(null, `image-${Date.now()}.${ext}`);
  }
});
const upload = multer({
  storage: multerConfig
});
const multerConfig2 = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, '../my-react-app/public/');
  },
  filename: function (req, file, callback) {
      const ext = file.mimetype.split('/')[1];
    callback(null, `favicon.ico`);
  }
});
const upload2 = multer({
  storage: multerConfig2
})
 
//@type   POST
//route for post data


  app.post('/upload', upload2.single('file'), (req, res) => {
    console.log(req.file.filename)
    const t = req.query.t;
    const b = req.query.b;
    const file = req.file.filename;
      if (!req.file) {
        return res.json({
          auth: false
        });
    
      }else {
        console.log(req.file.filename)
        var imgsrc = 'http://127.0.0.1:3000/' + req.file.filename
        var insertData = "INSERT INTO posts (Title, body, file_src)VALUES(?,?,?)"
        try{
        con.query(insertData, [t, b, imgsrc], (err, result) => {
            if(err){
              res.json({auth:false})
              return;
            }
            if(result){
              res.json({auth:true})
              return;
            }else{
              res.json({auth:false})
              return;
            }
        })
    }catch(err){
      res.json({auth:false})
      con.end();
      return;
    }
}
});
app.get('/register', (req, res)=>{
  const un = req.query.un;
  const em = req.query.em;
  const fn = req.query.fn;
  const pn = req.query.pn;
  const cp = req.query.cp;
  const ps = req.query.ps;
  const rf = req.query.rf;
  const at = req.query.at;
  const sq = req.query.sq;
  const sa = req.query.sa;
  const ba = "1000";
  const ac = "0";

  try{
    con.query("SELECT * FROM coupon WHERE couponid = ?", cp, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result.length > 0){
        const r = result[0].used;
        
        if(r === "1"){
          con.query("INSERT INTO users (username, fullname, email, Pnumber, coupon, password, referee, AT, SQ, SA, balance, activities) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [un, fn, em, pn, cp, ps, rf, at, sq, sa, ba, ac], (err, result)=>{
            if(err){
              res.json({auth: false, status: 401})
              return;
            }
            if(result){
              const num = 2
              con.query("UPDATE coupon SET used = ? WHERE couponid = ?", [num, cp], (err, result)=>{
                if(err){
                  res.json({auth: false})
                  return
                }
                if(result){
                  con.query("SELECT * FROM users WHERE username = ?", rf, (err, result)=>{
                    if(err){
                      res.json({auth: true})
                      return 
                    }
                    if(result.length > 0){
                      const ba = result[0].activities + 1100;
                      const tr = result[0].totref + 1;
                      con.query("UPDATE users SET totref = ?, activities = ? WHERE username = ?", [tr, ba, rf], (err, result)=>{
                        if(err){
                          res.json({auth: true})
                      return
                        }
                        if(result){
                          res.json({auth: true})
                          return
                        }else{
                          res.json({auth: true})
                          return
                        }
                      })
                      console.log(ba + tr + rf)
                    }else{
                      res.json({auth: true})
                      return
                    }
                  })
                }else{
                  res.json({auth: false})
                  return
                }
              })
            }else{
              res.json({auth:false, status: 404})
              return;
            }
          })
        }else{
          res.json({auth: false, status: 405})
        }
      }else{
        res.json({auth: false, status:502})
      }
    })
    

}
catch(err){
  res.json({auth: false,status : 400})
  con.end()
  return;
}
})
app.get("/login", (req, res)=>{
  const em = req.query.em;
  const ps = req.query.ps;
  try{
    con.query("SELECT * FROM users WHERE username = ? AND password = ?", [em, ps], (err, result)=>{
      if(err){
        res.json({auth: false, status: 401})
        return;
      }
      if(result.length > 0){
        res.json({auth : true, result: result})
        return
      }else{
        res.json({auth:false, status: 404})
        return;
      }
    })
  }catch(err){
    res.json({auth: false,status : 400})
    con.end()
    return;
  }
})
app.get("/withdraw", (req, res)=>{
  const fr = req.query.from;
  const to = req.query.to;
  const am = req.query.am;
  const un = req.query.un;
  const accname = req.query.an;
  const bank = req.query.b;
  try{
    con.query("INSERT INTO withdrawal (balance, accnumber, Accname, amount, Bank, username) VALUES(?,?,?,?,?,?)", [fr, to, accname, am, bank,un], (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth : true})
        return
      }else{
        res.json({auth:false})
        return;
      }
    })
  }
  catch(err){
    res.json({auth: false})
    con.end()
    return;
  }
})
app.get("/check", (req, res)=>{
  const cp = req.query.cp;
  try{
    con.query("SELECT * FROM coupon WHERE couponid = ?", cp, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result.length > 0){
        const r = result[0].used;
        
        if(r === "1"){
          res.json({auth: true})
          return
        }else{
          res.json({auth: false, status: 405})
          return
        }
      }else{
        res.json({auth: false, status:502})
        return;
      }
    })
    

}
catch(err){
  res.json({auth: false})
  con.end();
  return;
}
})
app.get("/allusers", (req, res)=>{
  const lm = req.query.limit;
  try{
    con.query(`SELECT * FROM users ORDER BY id DESC LIMIT ${lm}`, (err, result)=>{
      if(err){
        res.json({auth: false});
        return;
      }
      if(result.length > 0){
        res.json({auth: true, result : result})
        return
      }else{
        res.json({auth: true})
        return;
      }
    })
  }
  catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/allcoupon", (req, res)=>{
  const lm = req.query.limit;
  try{
    con.query(`SELECT * FROM coupon ORDER BY id DESC LIMIT ${lm}`, (err, result)=>{
      if(err){
        res.json({auth: false});
        return;
      }
      if(result.length > 0){
        res.json({auth: true, result : result})
        return
      }else{
        res.json({auth: true})
        return;
      }
    })
  }
  catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/allvendor", (req, res)=>{
  try{
    con.query(`SELECT * FROM vendor ORDER BY id ASC`, (err, result)=>{
      if(err){
        res.json({auth: false});
        return;
      }
      if(result){
        res.json({auth: true, result : result})
        return
      }else{
        res.json({auth: true})
        return;
      }
    })
  }
  catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/createcoupon", (req, res)=>{
  const pre = req.query.pref
  const id = pre + "-" + generateUniqueId();
 const idme = id.toUpperCase()
 const num = "1";
 const vend = req.query.id;
 try{
  con.query("INSERT INTO coupon (couponid, ven, used) VALUES(?,?,?)", [idme, vend, num], (err, result)=>{
    if(err){
      res.json({auth: false})
      return;
    }
    if(result){
      res.json({auth: true})
      return
    }else{
      res.json({auth: false})
      return;
    }
  })
 }catch(err){
  res.json({auth: false})
  con.end();
  return
 }
})
app.get("/addup", (req, res)=>{
  const id = req.query.id;
  try{
    con.query("SELECT activities FROM users WHERE id = ?", id, (err, result)=>{
      if(err){
        res.json({auth: false})
        return
      }
      if(result){
        const y = result[0].activities + 250;
        console.log(y)
      }else{
        res.json({auth: false})
        return
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
        return
  }
})
app.get("/blockvendor", (req, res)=>{
  const id = req.query.id;
  try{
    con.query("DELETE FROM vendor WHERE id = ?", id, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return;
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/blockuser", (req, res)=>{
  const id = req.query.id;
  try{
    con.query("DELETE FROM users WHERE id = ?", id, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return;
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/makevendor", (req, res)=>{
  const id = req.query.id;
  const name = req.query.name;
  const num = req.query.num;
  try{
    con.query("INSERT INTO vendor (Name, Pnumber, userid) VALUES(?,?,?)", [name, num, id], (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return;
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/withdrawshow", (req, res)=>{
 try{
  con.query("SELECT * FROM withdrawal ORDER BY id DESC LIMIT 50", (err, result)=>{
    if(err){
      res.json({auth: false})
      return;
    }
    if(result){
      res.json({auth: true, result: result})
      return
    }else{
      res.json({auth: false})
      return
    }
  })
 }
 catch(err){
  res.json({auth: false})
  con.end()
  return
 }
})
app.get("/withswitch", (req, res)=>{
  try{
    con.query("SELECT withdraw FROM withswitch", (err, result)=>{
      if(err){
        res.json({auth: true})
        return
      }
      if(result){
        res.json({auth: true, result: result})
        return
      }else{
        res.json({auth: true})
        return
      }
    })
  }
  catch(err){
    res.json({auth: false})
  con.end()
  return 
  }
})
app.get("/offswitch", (req, res)=>{
  try{
    con.query("UPDATE withswitch SET withdraw = 2", (err, result)=>{
      if(err){
        res.json({auth: false})
        return
      }
      if(result){
        res.json({auth: true})
        return;
      }else{
        res.json({auth: false})
        return
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
        return
  }
})
app.get("/onswitch", (req, res)=>{
  try{
    con.query("UPDATE withswitch SET withdraw = 1", (err, result)=>{
      if(err){
        res.json({auth: false})
        return
      }
      if(result){
        res.json({auth: true})
        return;
      }else{
        res.json({auth: false})
        return
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end();
        return
  }
})
app.get("/post",(req, res)=>{
  try{
    con.query("SELECT * FROM sponsored", (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true, result: result})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/hiw",(req, res)=>{
  try{
    con.query("SELECT * FROM hiw", (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true, result: result})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/savesp", (req, res)=>{
  const sp = req.query.sp;
  try{
    con.query("UPDATE sponsored SET postbody = ?", sp, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/savehw", (req, res)=>{
  const hw = req.query.hw;
  try{
    con.query("UPDATE hiw SET post = ?", hw, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/saveann", (req, res)=>{
  const an = req.query.an;
  try{
    con.query("UPDATE announce SET anouncement = ?", an, (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/share", (req, res)=>{
  const un = req.query.un;
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const d = new Date();
  let day = weekday[d.getDay()];
  try{
    con.query("SELECT * FROM share WHERE username = ? AND day = ?", [un, day], (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result.length > 0){
        res.json({auth: true})
        return
      }else{
       con.query("INSERT INTO share (username, day) VALUES (?,?)", [un, day], (err, result)=>{
        if(err){
          res.json({auth: false})
          return;
        }
        if(result){
          con.query("SELECT balance FROM users WHERE username = ? ", un, (err, result)=>{
            if(err){
              res.json({auth: false})
              return; 
          }
          if(result){
            const re = result[0].balance + 300;
            con.query("UPDATE users SET balance = ? WHERE username = ?", [re, un], (err, result)=>{
              if(err){
                res.json({auth: false})
                return; 
            }
            if(result){
              res.json({auth: true, stat : "Trust"})
                return;
            }else{
              res.json({auth: false})
                return;
            }
            })
          }
          })
        }else{
          res.json({auth: false})
          return;
        }
       })
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end()
    return;
  }
})
app.get("/user", (req, res)=>{
  const un = req.query.un;
  try{
    con.query("SELECT * FROM users WHERE username = ?", un, (err, result)=>{
      if(err){
        res.json({auth: false, status: 401})
        return;
      }
      if(result.length > 0){
        res.json({auth : true, result: result})
        return
      }else{
        res.json({auth:false, status: 404})
        return;
      }
    })
  }catch(err){
    res.json({auth: false,status : 400})
    con.end()
    return;
  }
})
app.get("/getvendor", (req, res)=>{
  const id = req.query.id;
  try{
  con.query("SELECT * FROM vendor WHERE userid = ?", id, (err, result)=>{
    if(err){
      res.json({auth : false})
      return
    }
    if(result.length > 0){
      res.json({auth: true})
      return
    }else{
      res.json({auth : false})
      return
    }
  })
}
catch(err){
  res.json({auth : false})
  con.end();
      return
}
})
app.get("/logbonus", (req, res)=>{
  const un = req.query.un;
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const d = new Date();
  let day = weekday[d.getDay()];
  try{
    con.query("SELECT * FROM login WHERE username = ? AND day = ?", [un, day], (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result.length > 0){
        res.json({auth: true})
        return
      }else{
       con.query("INSERT INTO login (username, day) VALUES (?,?)", [un, day], (err, result)=>{
        if(err){
          res.json({auth: false})
          return;
        }
        if(result){
          con.query("SELECT balance FROM users WHERE username = ? ", un, (err, result)=>{
            if(err){
              res.json({auth: false})
              return; 
          }
          if(result){
            const re = result[0].balance + 200;
            con.query("UPDATE users SET balance = ? WHERE username = ?", [re, un], (err, result)=>{
              if(err){
                res.json({auth: false})
                return; 
            }
            if(result){
              res.json({auth: true, stat : "Trust"})
                return;
            }else{
              res.json({auth: false})
                return;
            }
            })
          }
          })
        }else{
          res.json({auth: false})
          return;
        }
       })
      }
    })
  }catch(err){
    res.json({auth: false})
    con.end()
    return;
  }
})
app.get("/announce",(req, res)=>{
  try{
    con.query("SELECT * FROM announce", (err, result)=>{
      if(err){
        res.json({auth: false})
        return;
      }
      if(result){
        res.json({auth: true, result: result})
        return
      }else{
        res.json({auth: false})
        return
      }
    })
   }
   catch(err){
    res.json({auth: false})
    con.end()
    return
   }
})
app.get("/coupons", (req, res)=>{
  const lm = req.query.id;
  try{
    con.query(`SELECT * FROM coupon WHERE ven = ? ORDER BY id DESC `,lm, (err, result)=>{
      if(err){
        res.json({auth: false});
        return;
      }
      if(result.length > 0){
        res.json({auth: true, result : result})
        return
      }else{
        res.json({auth: true, result : result})
        return;
      }
    })
  }
  catch(err){
    res.json({auth: false})
    con.end();
    return;
  }
})
app.get("/userchecker", (req, res)=>{
  const un = req.query.un;
  try{
    con.query("SELECT * FROM users WHERE username = ?", un, (err, result)=>{
      if(err){
        res.json({auth: false, status: 401})
        return;
      }
      if(result.length > 0){
        res.json({auth : false})
        return
      }else{
        res.json({auth:true})
        return;
      }
    })
  }catch(err){
    res.json({auth: false,status : 400})
    con.end()
    return;
  }
})
app.listen(3001, () =>{
    console.log("running server");
    });
