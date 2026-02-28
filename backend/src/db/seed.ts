import mongoose from 'mongoose';
import dots from 'dotenv';
import path from 'path';
import { Assignment } from '../models/schemas';

dots.config({ path: path.resolve(__dirname, '../../.env') });

const assignments = [
  {
    title: 'Basic SELECT Statement',
    description: 'Learn how to retrieve data from a single table',
    difficulty: 'easy',
    question: 'Write a query to retrieve the names and emails of all users.',
    expectedColumns: ['name', 'email'],
    hints: [
      'Start with the SELECT keyword followed by the column names you want.',
      'Use the FROM keyword to specify which table to query from.'
    ],
    sampleData: {
      tables: ['users', 'posts', 'comments'],
      description: 'Users table contains user profiles with id, name, email, and created_at'
    },
    solution: 'SELECT name, email FROM users;'
  },
  {
    title: 'JOIN Multiple Tables',
    description: 'Practice joining tables to get related data',
    difficulty: 'medium',
    question: 'Write a query to get all posts along with the names of the users who wrote them. Include the post title, content, and user name.',
    expectedColumns: ['title', 'content', 'name'],
    hints: [
      'You need to combine data from two tables: posts and users.',
      'Think about how posts and users are related - look for a common field.',
      'Use an INNER JOIN or LEFT JOIN to connect the tables.'
    ],
    sampleData: {
      tables: ['users', 'posts', 'comments'],
      description: 'Posts table has user_id that references users table'
    },
    solution: 'SELECT p.title, p.content, u.name FROM posts p JOIN users u ON p.user_id = u.id;'
  },
  {
    title: 'Aggregate Functions',
    description: 'Use COUNT, SUM, AVG to analyze data',
    difficulty: 'medium',
    question: 'Write a query to count how many posts each user has written. Show the user name and the number of posts, ordered by post count in descending order.',
    expectedColumns: ['name', 'post_count'],
    hints: [
      'You need to COUNT posts and group them by user.',
      'Use GROUP BY to aggregate data by user.',
      'ORDER BY can help you sort the results.'
    ],
    sampleData: {
      tables: ['users', 'posts'],
      description: 'Count posts per user by joining users and posts tables'
    },
    solution: 'SELECT u.name, COUNT(p.id) as post_count FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id, u.name ORDER BY post_count DESC;'
  },
  {
    title: 'WHERE Clause Filtering',
    description: 'Filter data using WHERE conditions',
    difficulty: 'easy',
    question: 'Write a query to find all posts created in the last 30 days.',
    expectedColumns: ['title', 'created_at'],
    hints: [
      'You need to filter posts based on their creation date.',
      'Compare the created_at timestamp with a date calculation.',
      'Consider using NOW() - INTERVAL for relative date comparison.'
    ],
    sampleData: {
      tables: ['posts'],
      description: 'Posts have a created_at timestamp'
    },
    solution: "SELECT title, created_at FROM posts WHERE created_at >= NOW() - INTERVAL '30 days';"
  },
  {
    title: 'Subqueries and Filtering',
    description: 'Use subqueries to solve complex problems',
    difficulty: 'hard',
    question: 'Write a query to find users who have written more than 2 posts. Show their name and the count of their posts.',
    expectedColumns: ['name', 'post_count'],
    hints: [
      'You can use a subquery to calculate post counts, then filter on that.',
      'Or use GROUP BY with HAVING clause to filter grouped results.',
      'Think about which approach is cleaner.'
    ],
    sampleData: {
      tables: ['users', 'posts'],
      description: 'Find power users who have created multiple posts'
    },
    solution: 'SELECT u.name, COUNT(p.id) as post_count FROM users u JOIN posts p ON u.id = p.user_id GROUP BY u.id, u.name HAVING COUNT(p.id) > 2;'
  },
  {
    title: 'Multi-table JOIN with Comments',
    description: 'Work with three related tables',
    difficulty: 'hard',
    question: 'Write a query to find the user who posted the most commented post. Show the post title, user name, and comment count.',
    expectedColumns: ['title', 'name', 'comment_count'],
    hints: [
      'You need to join posts, users, and comments tables.',
      'Count comments and group by post.',
      'Order by comment_count to find the most commented post.'
    ],
    sampleData: {
      tables: ['users', 'posts', 'comments'],
      description: 'Join three tables to find relationships'
    },
    solution: 'SELECT p.title, u.name, COUNT(c.id) as comment_count FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id GROUP BY p.id, p.title, u.name ORDER BY comment_count DESC LIMIT 1;'
  }
];

const seedAssignments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ciphersqlstudio');
    console.log('Connected to MongoDB');

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('Cleared existing assignments');

    // Insert new assignments
    const result = await Assignment.insertMany(assignments);
    console.log(`Successfully seeded ${result.length} assignments`);

    // List inserted assignments
    const inserted = await Assignment.find().select('-solution');
    console.log('\nSeeded Assignments:');
    inserted.forEach((assignment, index) => {
      console.log(`${index + 1}. ${assignment.title} (${assignment.difficulty})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAssignments();
