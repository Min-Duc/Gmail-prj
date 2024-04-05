const mysql = require('mysql2');

const dbConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'wpr',
      password: 'fit2023'
    }).promise();

    await connection.query('CREATE DATABASE IF NOT EXISTS wpr2023');

    await connection.query('USE wpr2023');

    const createUsersTable = (
      `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(60) NOT NULL,
      email VARCHAR(60) UNIQUE NOT NULL,
      password VARCHAR(60) NOT NULL
    )`
    );
    await connection.query(createUsersTable);
    console.log("users created!");

    const createEmailsTable = `CREATE TABLE IF NOT EXISTS emails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receiver_id INT NOT NULL,
      receiver VARCHAR(60) NOT NULL,
      sender_id INT NOT NULL,
      sender VARCHAR(60) NOT NULL,
      subject VARCHAR(255),
      body TEXT,
      attachment VARCHAR(255),
      time TIMESTAMP NOT NULL,
      senderDeleted BOOLEAN DEFAULT false,
      receiverDeleted BOOLEAN DEFAULT false,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`;


    await connection.query(createEmailsTable);
    console.log("emails created!");

    const insertUsersQuery = `
      INSERT IGNORE INTO users (full_name, email, password) VALUES
        ('Mr A', 'a@a.com', '12345678'),
        ('Vuong Minh Duc', 'minhduc@gmail.com', '12345678'),
        ('Philosophy', 'new@gmail.com', '12345678');
    `;

    connection.query(insertUsersQuery)
    console.log("users'emails created!");

    const insertEmailsQuery = `
      INSERT IGNORE INTO emails (receiver_id, receiver, sender_id, sender, subject, body) VALUES 
      (1, 'Mr A', 2, 'Vuong Minh Duc', 'Important Message', 'This is important email'),
      (1, 'Mr A', 2, 'Vuong Minh Duc', 'Hello', 'Hi, how are you?'), 
      (1, 'Mr A', 2, 'Vuong Minh Duc', 'Greeting', 'Something friendly or polite that you say or do when you meet or welcome someone.'),
      (1, 'Mr A', 2, 'Vuong Minh Duc', 'I have no concept of individuality.', 'Slightly less popular thing is underrated. I like slightly less popular thing. Popular thing is overrated.'),
      (1, 'Mr A', 3, 'Philosophy', 'Second', 'Immediately after the first and before any others or the position in which a person finishes a race or competition if they finish immediately behind the winner'),
      (1, 'Mr A', 3, 'Philosophy', 'Third', 'an undergraduate degree from a university in the UK and some other countries that is below a second-class degree'),
      (1, 'Mr A', 3, 'Philosophy', 'LETS GO', 'What does lets go mean? Lets go is an expression variously and widely used to take leave, show excitement, cheer, express impatience, or challenge someone'),
      (1, 'Mr A', 3, 'Philosophy', 'Swowo', 'SWOsOWSWO'),
      (1, 'Mr A', 3, 'Philosophy', 'Your life is everything', 'You serve all purpose. You should treat yourself now. And give yourself a piece of that oxygen, in ozone layer, thats covered up so that we can breathe inside this blue trapped bubble. Because what am I here for? To worship you! Love yourself! I mean that with a hundred percent with a thousand percent.'),
      (2, 'Vuong Minh Duc', 3, 'Philosophy', 'Thank you', 'Tearalament strongest'),
      (2, 'Vuong Minh Duc', 1, 'Mr A', 'Hi', 'I am fine, thank you! And you?'),
      (2, 'Vuong Minh Duc', 1, 'Mr A', 'Thanks', 'Nice to speak with you'),
      (2, 'Vuong Minh Duc', 1, 'Mr A', 'Bye', 'Hope to speak with you again soon.'),
      (2, 'Vuong Minh Duc', 3, 'Philosophy', 'STop', 'None'),
      (2, 'Vuong Minh Duc', 3, 'Philosophy', 'Toothpaste', 'The main ingredient in toothpaste is some kind of flouride salt, like sodium flouride or stannous flouride. Some cheaper brands of toothpaste will settle with olaflur, a hydrophobic organic flouride salt. In the mouth salivary amylase breaks this down into a harmless organic chemical and free flouride ion. The flouride is what helps kill bacteria. However, olaflur, by virtue of being a long chain organic molecule, is somewhat lipophilic, meaning it can pass through phospholipid bilayer membranes (ie cell membranes, ie your skin).'),
      (2, 'Vuong Minh Duc', 3, 'Philosophy', '2', 'L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_L_'),
      (3, 'Philosophy', 1, 'Mr A', 'gearbox', 'The gearbox can therefore be regarded as a single component regardless of the complexity of the inner structure'),
      (3, 'Philosophy', 1, 'Mr A', 'First', '(a person or thing) coming before all others in order, time, amount, quality, or importance'),
      (3, 'Philosophy', 1, 'Mr A', 'HellO', 'The front door was open so she walked inside and called out, Hello! Is there anybody in?'),
      (3, 'Philosophy', 1, 'Mr A', 'Lets see!', 'Now that we know what your interests are, lets see if we can match you to a job youd like.'),
      (3, 'Philosophy', 2, 'Vuong Minh Duc', 'Perry', 'the platypus?'),
      (3, 'Philosophy', 2, 'Vuong Minh Duc', 'A?', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    `;

    connection.query(insertEmailsQuery)
    console.log("SentEmails created!")
  
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error occurred:', error);
  }
};


dbConnection();
