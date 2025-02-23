const mysql = require('mysql');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

//for email
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'superadmin',
  password: 'Hosting#2022',
  database: 'fundlights_db',
  port: '3307'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.get('/data', (req, res) => {
  const query = 'SELECT * FROM users';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

app.post('/login', (req, res) => {
  const sql = 'SELECT * FROM users WHERE `email` = ? AND `password` = ?';
  connection.query(sql, [req.body.email, req.body.password],(err, results) => {
    if (err) {
      return res.json("Error")
    } 
      if(results.length === 1){
        
        const token = jwt.sign({ username: req.body.email }, 'fundlights');
        email=req.body.email
        msg="Success"
        username=results[0]['name']
        const validUserObj = { accessToken: token, username: username, status: msg, email: email};
        return res.json(validUserObj);

      } else{
        return res.json("LoginFailed");
      }
    
  });
});

app.post('/register', (req, res) => {
  const sql = 'INSERT INTO users (`email`,`username`,`password`) VALUES (?,?,?)';
  connection.query(sql, [req.body.email, req.body.username, req.body.password],(err, results) => {
    if (err) {
      return res.json("Error")
    }  if(results.length === 1){
        
        return res.json(results);

    }
  });
});

//Login as Company Partner 

app.post('/partner-login', (req, res) => {
  const sql = 'SELECT * FROM company_partners WHERE `email` = ? AND `password` = ?';
  connection.query(sql, [req.body.email, req.body.password],(err, results) => {
    if (err) {
      return res.json({ status:"Error", message:"Having some issue error code#0001, please try after sometime!" })
    } 
      if(results.length === 1){
        
        const token = jwt.sign({ username: req.body.email }, 'fundlightscompany');
        email=req.body.email
        code="Success"
        company=results[0]['company_name']
        company_id=results[0]['id']
        const validUserObj = { accessToken: token, company: company, status: code, email: email, company_id: company_id};
        return res.json(validUserObj);

      } else{
        return res.json({ status:"Failed" , message:"Invalid Username or Password!" });
      }
    
  });
});

//Login as Company employee 

app.post('/partneremp_login', (req, res) => {
  const sql = 'SELECT * FROM company_users WHERE `email` = ? AND `password` = ?';
  connection.query(sql, [req.body.email, req.body.password],(err, results) => {
    if (err) {
      return res.json({ status:"Error", message:"Having some issue error code#0001, please try after sometime!" })
    } 
      if(results.length === 1){
        
        const token = jwt.sign({ username: req.body.email }, 'fundlightscompanyemp');
        email=req.body.email
        code="Success"
        empname=results[0]['firstname']
        company_id=results[0]['company_id']
        emp_id=results[0]['id']
        const validUserObj = { accessToken: token, empname: empname, status: code, email: email, company_id: company_id, emp_id: emp_id};
        return res.json(validUserObj);

      } else{
        return res.json({ status:"Failed" , message:"Invalid Username or Password!" });
      }
    
  });
});


//Register Partner Company
app.post('/partner-register', (req, res) => {

  const sqlcheck = 'SELECT * FROM company_partners WHERE `email` = ?';
  connection.query(sqlcheck, [req.body.email], (errcheck, checkresult) => {
    if (errcheck) {
      return res.json({ status:"Error", message:"Having some issue error code#0002, please try after sometime!" })
    }else{
      if(checkresult.length === 1) {
        return res.json({status: "Failed", message: "Account already registred with this Email ID!"})
      }else {
        const sql = 'INSERT INTO company_partners (`company_name`,`company_code`,`email`,`password`,`mobile`) VALUES (?,?,?,?,?)';
        connection.query(sql, [req.body.company, req.body.compaycode, req.body.email, req.body.password, req.body.mobile],(err, results) => {
          if (err) {
            return res.json({ status:"Error", message:"Having some issue error code#0002, please try after sometime!" })
          }else{
            email=req.body.email
            company=req.body.company
            code="Success"
            msg= "Company has been registered with us successfully, Fundlights team will contact you soon."
            const partnerRegObj = { status: code, message: msg, user: email, company: company};
            return res.json(partnerRegObj);
        }
        });
      }
    }
  })
  
});


//getting profile data
app.post('/profile', (req, res) => {
  const query = 'SELECT * FROM company_users WHERE `email` = ? ';
  connection.query(query, [req.body.email],(err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});

// Single Onboarding Users
app.post('/onboardingsingle', (req, res) => {

  const sql = 'INSERT INTO company_users (`company_id`,`firstname`,`lastname`,`email`,`password`,`mobile`,`gender`,`emp_number`,`PAN`,`address`) VALUES (?,?,?,?,?,?,?,?,?,?)';
  connection.query(sql, [req.body.company_id,req.body.firstname,req.body.lastname,req.body.email, req.body.password, req.body.mobile, req.body.gender, req.body.empnumber, req.body.pan, req.body.address],(err, results) => {
    if (err) {
      return res.json("Error")
    }else{
      username = req.body.email;
      password = "fundlights#123"
      to_email = req.body.email,
      email_subject = "Welcome to FundLights - Your User Registration is Complete!",
      email_body = `We are thrilled to welcome you to FundLights Thank you for choosing us as your trusted platform. Your user registration is now complete, and we're excited to have you as part of our community.<br/></br>
      
      <b>Here are a few important details to get you started:</b><br/><br/>
      <b>Your Username: ${username}</b><br/>
      <b>Default Password: ${password}</b><br/><br/>
      
      Now that you are a registered user, you can take full advantage of everything FundLightshas to offer.<br/>
      
      We look forward to serving you and providing you with an outstanding experience.`;
      genericEmailSend(to_email, email_subject, email_body);

        email=req.body.email
        msg="Success"
        const onboardUserObj = { status: msg, user: email};
        return res.json(onboardUserObj);
    }
  });
});

//getting  data for partner dashboard 
app.post('/dashboard-partner', (req, res) => {
  //const query = 'SELECT * FROM potfolio_details WHERE `company_id` = ? ';
  const query = 'SELECT potfolio_details.*, mutual_fund_amc_details.nav FROM potfolio_details, mutual_fund_amc_details WHERE `company_id` = ? AND potfolio_details.scheme_code = mutual_fund_amc_details.scheme_code';
  connection.query(query, [req.body.company_id],(err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});


//getting  data for partner Onboarded Users 
app.post('/onboarded-users', (req, res) => {
  //const query = 'SELECT * FROM company_users WHERE `company_id` = ? ';

  const query = 'SELECT company_users.id,company_users.company_id,company_users.firstname, company_users.lastname, company_users.email, company_users.mobile,company_users.emp_number, company_users.folio_number, potfolio_details.amc, potfolio_details.transaction_type, potfolio_details.amount AS SIP, SUM(potfolio_details.amount) AS total_amt, SUM(potfolio_details.number_of_units) AS total_units FROM company_users, potfolio_details WHERE company_users.id = potfolio_details.company_user_id AND potfolio_details.company_id= ? GROUP BY company_users.id, company_users.folio_number, company_users.firstname, potfolio_details.company_user_id, potfolio_details.amc';
  connection.query(query, [req.body.company_id],(err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
    } else {
      res.json(results);
    }
  });
});


//getting  data for Company employee dashboard 
app.post('/dashboard-companyuser', (req, res) => {
  //const query = 'SELECT * FROM potfolio_details WHERE `company_id` = ? AND `company_user_id` = ?';
  const query = 'SELECT potfolio_details.*, mutual_fund_amc_details.nav FROM potfolio_details, mutual_fund_amc_details WHERE `company_id` = ? AND `company_user_id` = ? AND potfolio_details.scheme_code = mutual_fund_amc_details.scheme_code';
  connection.query(query, [req.body.company_id, req.body.company_user_id],(err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.sendStatus(500);
    } else {
      console.warn(results);
      res.json(results);
    }
  });
});

//Generic Send Email  just provide required params
function genericEmailSend(toEmail, emailSubject, mailBody) {

  const transporter = nodemailer.createTransport(smtpTransport({
    name: 'a2hosting',
    host: "sg1-ts108.a2hosting.com",
    port: 465,
    secure: true,
    auth: {
      user: 'info@fundlights.com',
      pass: 'Fundlights#1234'
    }
  }));
  
  let mailbody = mailBody;
  let msgbody = `<pre>Dear User,

${mailbody}
        
Thank you for using our services.
        
<b>Best Regards</b>,
<b>FundLights Team</b>
<b>EmailID: info@fundlights.com</b></pre>`;

  let messagebody ={
    from: '"FundLights" <info@fundlights.com>', // sender address
    to: toEmail, // list of receivers
    subject: emailSubject, // Subject line
    html: msgbody, // html body
  }

  transporter.sendMail(messagebody);

};

//sending email for Contact Us
app.post('/sendemail', (req, res) => {

  const transporter = nodemailer.createTransport(smtpTransport({
    name: 'a2hosting',
    host: "sg1-ts108.a2hosting.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'info@fundlights.com',
      pass: 'Fundlights#1234'
    }
  }));
  
  let msgbody="<b>Name:</b> "+req.body.fullname+" <br/><b>Mobile:</b> "+req.body.mobile+" <br/><b>EmailID</b>: "+req.body.email+" <br/><b>Message:</b> "+req.body.message

  let messagebody ={
    from: '"FundLights" <info@fundlights.com>', // sender address
    to: "info@fundlights.com", // list of receivers
    subject: "Contact Us - Enquiry From - "+req.body.fullname, // Subject line
    //text: req.body.message, // plain text body
    //html: "<b>Hello world?</b>", // html body
    html: msgbody,
  }

  transporter.sendMail(messagebody).then(() => {
    //return res.status(201).json({ msg: "you should receive an email!" })
    console.warn("sent email");
        email=req.body.email
        msg="Success"
        const onboardUserObj = { status: msg, user: email};
        return res.json(onboardUserObj);
  }).catch(error => {
    //return res.status(500).json({ error })
    console.warn(error);
    return res.json("Error")
  })
  
  
});

//Forgot Password - Company User Password 
app.post('/forgot-password-com-usr', (req, res) => {
  const transporter = nodemailer.createTransport(smtpTransport({
    name: 'a2hosting',
    host: "sg1-ts108.a2hosting.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'info@fundlights.com',
      pass: 'Fundlights#1234'
    }
  }));

  const sql = 'SELECT id, email, password FROM company_users WHERE email = ?';
  connection.query(sql, [req.body.email],(err, results) => {
    if (err) {
      return res.json("Error")
    }else{
      if(results.length === 1){
        const secretkey = req.body.email + "thjkUJsdgduDBUYUH"
        const token = jwt.sign({ username: req.body.email }, secretkey, {expiresIn: '5m'});
        const uid= results[0]['id']
        //const link= `http://localhost:3001/reset-password-cu/${uid}/${token}`;
        const link= `${req.body.api_link}/reset-password-cu?email=${req.body.email}&passcode=${token}`;
       
        let msgbody = `<pre>Dear User,

        We have received a request to reset your password. To proceed with the password reset, please follow the instructions below:
        
        <b>Click on the following link to reset your password:</b>
        <a href='${link}'>${link}</a>

        If you cannot click on the link, please copy and paste it into your web browser's address bar.
        
        Please note that this password reset link is valid for a limited time and will expire after 5 mins. If you did not request a password reset, please ignore this email.
        
        For security reasons, do not share this email or the password reset link with anyone. If you suspect any unauthorized activity on your account, please contact our support team immediately.
        
        Thank you for using our services.
        
        <b>Best Regards</b>,
        <b>FundLights Team</b>
        <b>EmailID: info@fundlights.com</b></pre>`;
        let messagebody ={
          from: '"FundLights" <info@fundlights.com>', // sender address
          to: req.body.email, // list of receivers
          subject: "Password Reset", // Subject line
          //text: req.body.message, // plain text body
          html: msgbody,
        }

        transporter.sendMail(messagebody).then(() => {
          //return res.status(201).json({ msg: "you should receive an email!" })
              email=req.body.email
              msg="Success"
              const resetPassowrdObj = { status: msg, token: token};
              return res.json(resetPassowrdObj);
        }).catch(error => {
          //return res.status(500).json({ error })
          return res.json("Error")
        })

        
      }else {
        return res.json({status:"User Not Exists!"});
      }
       
    }
  });
});

//Forgot Password - Company  
app.post('/forgot-password-company', (req, res) => {
  const transporter = nodemailer.createTransport(smtpTransport({
    name: 'a2hosting',
    host: "sg1-ts108.a2hosting.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'info@fundlights.com',
      pass: 'Fundlights#1234'
    }
  }));

  const sql = 'SELECT id, email, password FROM company_partners WHERE email = ?';
  connection.query(sql, [req.body.email],(err, results) => {
    if (err) {
      return res.json("Error")
    }else{
      if(results.length === 1){
        const secretkey = req.body.email + "funthjkUJsdgduDBUYUHlightscom"
        const token = jwt.sign({ username: req.body.email }, secretkey, {expiresIn: '5m'});
        const uid= results[0]['id']
        //const link= `http://localhost:3001/reset-password-cu/${uid}/${token}`;
        const link= `${req.body.api_link}/reset-password-c?email=${req.body.email}&passcode=${token}`;
       
        let msgbody = `<pre>Dear Partner,

        We have received a request to reset your password. To proceed with the password reset, please follow the instructions below:
        
        <b>Click on the following link to reset your password:</b>
        <a href='${link}'>${link}</a>

        If you cannot click on the link, please copy and paste it into your web browser's address bar.
        
        Please note that this password reset link is valid for a limited time and will expire after 5 mins. If you did not request a password reset, please ignore this email.
        
        For security reasons, do not share this email or the password reset link with anyone. If you suspect any unauthorized activity on your account, please contact our support team immediately.
        
        Thank you for using our services.
        
        <b>Best Regards</b>,
        <b>FundLights Team</b>
        <b>EmailID: info@fundlights.com</b></pre>`;
        let messagebody ={
          from: '"FundLights" <info@fundlights.com>', // sender address
          to: req.body.email, // list of receivers
          subject: "Password Reset", // Subject line
          //text: req.body.message, // plain text body
          html: msgbody,
        }

        transporter.sendMail(messagebody).then(() => {
          //return res.status(201).json({ msg: "you should receive an email!" })
              email=req.body.email
              msg="Success"
              const resetPassowrdObj = { status: msg, token: token};
              return res.json(resetPassowrdObj);
        }).catch(error => {
          //return res.status(500).json({ error })
          return res.json("Error")
        })

        
      }else {
        return res.json({status:"User Not Exists!"});
      }
       
    }
  });
});

//Reset Company User Password 
app.post('/reset-password-cu', (req, res) => {
  //const { id, token}  = req.params;
  const sql = 'SELECT id, email, password FROM company_users WHERE email = ?';
  connection.query(sql, [req.body.email],(err, results) => {
    if (err) {
      return res.json("Error")
    }else{
      if(results.length === 1){
        const secret = req.body.email+'thjkUJsdgduDBUYUH';
        try {
          const verify = jwt.verify(req.body.token, secret);
          //res.send("Verified!")
          const sqlupdate = 'UPDATE company_users SET password= ? WHERE email = ?';
          connection.query(sqlupdate, [req.body.password,req.body.email],(err, results) => {
            if (err) {
              return res.json("Error")
            }else{
                msg="Success"
                return res.json({status: msg});
            }
          });

        } catch (error) {
          res.send("Not Verified!")
        }
      }else {
        return res.json({status:"User Not Exists!"});
      }
       
    }
  });  
});

//Reset Company Password 
app.post('/reset-password-c', (req, res) => {
  //const { id, token}  = req.params;
  const sql = 'SELECT id, email, password FROM company_partners WHERE email = ?';
  connection.query(sql, [req.body.email],(err, results) => {
    if (err) {
      return res.json("Error")
    }else{
      if(results.length === 1){
        const secret = req.body.email+'funthjkUJsdgduDBUYUHlightscom';
        try {
          const verify = jwt.verify(req.body.token, secret);
          //res.send("Verified!")
          const sqlupdate = 'UPDATE company_partners SET password= ? WHERE email = ?';
          connection.query(sqlupdate, [req.body.password,req.body.email],(err, results) => {
            if (err) {
              return res.json("Error")
            }else{
                msg="Success"
                return res.json({status: msg});
            }
          });

        } catch (error) {
          res.send("Not Verified!")
        }
      }else {
        return res.json({status:"User Not Exists!"});
      }
       
    }
  });  
});


app.listen(3001, () => {
  console.log('Server running on port 3001');
});
