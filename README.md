# Webbloggies

Write your Blog on here.

# Functionalities

- Its Blog website.
- User can resister and can write their blogs/articles.
- User can edit and delete his articles
- Anyone can visite and read all articles without logging in.

# Technologies

- Nodejs
- Expressjs
- Pug(Jade)
- Passportjs
- CSS
- HTML5
- Bootstarp

# App hosted on

- Heroku

# Image stored at Cloud

- Images(User Avatars and blog images) are stored at Cloud storage- Cloudinary.com using multer
- Previously images were stored locally on remote machine

# See App

Link: https://weblogies.herokuapp.com/

# To start the app follow the commands on command prompt:

1. git clone https://github.com/pankaj142/ArticleWebsite.git
2. Go to directory ArticleWebsite i.e cd ArticleWebsite
3. Install dependencies i.e npm install
4. Start app i.e npm start
5. Open url "localhost:3000" on browser
6. Sign up for cloudinary.com
7. Install multer and cloudinary into your project
   - npm i -S multer cloudinary
8. Replace cloud_name with your cloud name from the cloudinary dashboard (after logging in to the account you created).
9. create new file .env in root directory
10. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env file and assign them respective crediential values from your cloudinary account. And you are good to go.
    Thank you :)
