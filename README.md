# P2A HW -- Database Form Submitter

## Installation Instruction

Requires node.js & npm, runs on `nodemon`. Also requires a mySQL database connection.

Create a table in your database following this syntax: 

```sql
CREATE TABLE `submissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `EMAIL` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

Copy the .example.credentials.json and input the credentials necessary. For `adminToken` use any random string of numbers and letters. 

* `$ npm install`
* `$ npm start`

## Navigating and Accessing the Client

The application runs on [http://localhost:3535](http://localhost:3535). Submissions are accepted here. 

To access the admin portal, navigate to http://localhost:3535/?token=<admin_token>

## Known Issues and Limitations

There isn't a lot of checking happening on input - so phone numbers can be formatted however they are sent. 

Twilio doesn't like invalid phone numbers and the Send Message job will choke on invalid numbers. This could be more graceful and there is probably some Twilio API for validation but I've never used their API until tonight. 

The backend works fine for a project of this size. Normally I would split out the routes into more of a model/view/controller framework but for the sake of getting this functional I kept it all in one file and in singular functions. This would not scale well as is, so it should be refactored at some point. 

There is no pagination on the API to get all the submissions. 

We are looping through all phone numbers and sending to Twilio. That's probably ok in the short run (< 150 numbers) but we should probably use a different approach (I am guessing Twilio has a better way for bulk sending). 

We are using a pooled approach for database connections and limited to 10. This number could be increased if we anticipated the site being very popular. Additionally, I wouldn't use node to serve the frontend in real life - there is no need for it to handle static pages. I would use NGiNX or Apache probably, then set up CORS in the server. Again, not something worth doing in 3 hours. 

## Requirements

1. Create a form that accepts a name, email address, and phone number. 
2. When someone enters information on that form, save it to a database. 
3. Create functionality that would allow an administrator to login and send a text message to all of the phone numbers in the database using the [Twilio API](https://www.twilio.com/docs/usage/api).

Please use whatever technologies you are comfortable with. The finished product should be a link to a git repository where members of the Phone2Action team can clone and download your code and run it locally. You should also either deploy the finished product to a webpage and/or submit a video demo.

This is an opportunity to show off your skills. For example, if you are a strong front-end developer you should build a beautiful form. If you are stronger on the back-end, you might want to build a system that is scalable for millions of requests. 

Please limit your time spent on this exercise to 3 hours. When submitting, you can let us know what you would do if provided with more time. Please respond to this email with your submission by Sunday evening at midnight. If you have any questions, please don’t hesitate to get in touch! 