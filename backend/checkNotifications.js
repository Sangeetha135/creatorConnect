const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

async function checkRejectionNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    // Find all ALL_INVITATIONS_REJECTED notifications
    const rejectionNotifications = await Notification.find({ 
      type: 'ALL_INVITATIONS_REJECTED' 
    });
    
    console.log(`Found ${rejectionNotifications.length} rejection notifications:`);
    console.log(JSON.stringify(rejectionNotifications, null, 2));
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error checking notifications:', error);
    mongoose.disconnect();
  }
}

checkRejectionNotifications(); 