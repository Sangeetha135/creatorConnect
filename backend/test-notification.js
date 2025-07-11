const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

async function createTestNotification() {
  try {
    // Replace with a valid brand user ID from your database
    const brandId = '6806b8de7e2f57c1baa36ff1';  // Example ID, replace with real one
    
    const notification = await Notification.create({
      recipient: brandId,
      type: 'ALL_INVITATIONS_REJECTED',
      title: 'All Invitations Rejected (Test)',
      message: 'All invitations for your campaign "Test Campaign" have been rejected. You may want to invite more influencers or review your campaign details.',
      data: {
        campaignId: '6806ce7a86c3f56597e402f5',  // Example ID, replace with real one
        rejectedCount: 3,
        stats: {
          total: 3,
          accepted: 0,
          rejected: 3,
          pending: 0
        }
      }
    });
    
    console.log('Test notification created:', notification);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test notification:', error);
    mongoose.disconnect();
  }
}

createTestNotification(); 