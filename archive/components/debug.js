import React from 'react';

const DebugPanel = () => {
  const loadAllTestData = () => {
    localStorage.clear(); // Clear existing data first
    
    const testUsers = [
      {id:1001,email:"alex.hansen@nordea.com",password:"Password123",displayName:"Alex Hansen",role:"player",isVerified:true},
      {id:1002,email:"maria.larsen@nordea.com",password:"Password123",displayName:"Maria Larsen",role:"player",isVerified:true},
      {id:1003,email:"erik.nielsen@nordea.com",password:"Password123",displayName:"Erik Nielsen",role:"player",isVerified:true},
      {id:1004,email:"sofia.andersen@nordea.com",password:"Password123",displayName:"Sofia Andersen",role:"player",isVerified:true},
      {id:1005,email:"thomas.jensen@nordea.com",password:"Password123",displayName:"Thomas Jensen",role:"player",isVerified:true}
    ];

    const testPlayers = [
      {id:2001,name:"Alex Hansen",position:1,participationPoints:3,wins:12,losses:3,joinDate:"2024-08-15",isActive:true},
      {id:2002,name:"Maria Larsen",position:2,participationPoints:2,wins:10,losses:5,joinDate:"2024-08-20",isActive:true},
      {id:2003,name:"Erik Nielsen",position:3,participationPoints:1,wins:8,losses:7,joinDate:"2024-08-25",isActive:true},
      {id:2004,name:"Sofia Andersen",position:4,participationPoints:2,wins:6,losses:4,joinDate:"2024-09-01",isActive:true},
      {id:2005,name:"Thomas Jensen",position:5,participationPoints:0,wins:3,losses:2,joinDate:"2024-09-03",isActive:true}
    ];

    const testChallenges = [
      {id:3001,challengerId:2003,challengedId:2002,status:"pending",createdDate:"2024-09-04",expiryDate:"2024-09-25"},
      {id:3002,challengerId:2005,challengedId:2004,status:"accepted",createdDate:"2024-09-02",expiryDate:"2024-09-23"}
    ];

    localStorage.setItem('nordea_hh_squash_users', JSON.stringify(testUsers));
    localStorage.setItem('nordea_hh_squash_players', JSON.stringify(testPlayers));
    localStorage.setItem('nordea_hh_squash_challenges', JSON.stringify(testChallenges));
    
    alert('All 5 test users loaded!\n\nLogin credentials:\nalex.hansen@nordea.com / Password123\nmaria.larsen@nordea.com / Password123\nerik.nielsen@nordea.com / Password123\nsofia.andersen@nordea.com / Password123\nthomas.jensen@nordea.com / Password123');
    window.location.reload();
  };

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', background: '#fff', padding: '10px', border: '2px solid #ccc', borderRadius: '5px', zIndex: 9999, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <button 
        onClick={loadAllTestData} 
        style={{ padding: '8px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Load 5 Test Users
      </button>
    </div>
  );
};

export default DebugPanel;
