const bcrypt = require('bcryptjs');

async function hashPassword() {
  // Change this to your desired admin password
  const password = 'Light_cad#123'; // Replace with your password
  
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Password Hash Generator');
    console.log('========================');
    console.log('Original Password:', password);
    console.log('Hashed Password:', hashedPassword);
    console.log('\n📋 Copy the hashed password above for database insertion.');
    console.log('\n💡 You can now use this hash in your MongoDB insertion.');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

hashPassword(); 