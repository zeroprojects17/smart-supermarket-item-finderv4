import React, { useRef, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiuWoeQqVko2Mqn0qyu49mMAreYlPRbu0",
  authDomain: "schoolbus-led.firebaseapp.com",
  databaseURL: "https://item-finder-dc65b-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "item-finder-dc65b",
  storageBucket: "item-finder-dc65b.appspot.com",
  messagingSenderId: "928252308497",
  appId: "YOUR_APP_ID" // Replace with your app ID from Firebase project settings
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const userPaths = {
  "member1@gmail.com": {
    rfidReaderPath: 'rfid-reader',
    path: 'find-aisle'
  },
  "member2@gmail.com": {
    rfidReaderPath: 'rfid-reader2',
    path: 'find-aisle2'
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [startingAisle, setStartingAisle] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const canvasRef = useRef(null);
  const aisleRefs = useRef({});

  const users = {
    "member1@gmail.com": "member1@gmail.com", // Replace with actual passwords
    "member2@gmail.com": "member2@gmail.com"
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

  // Validate the credentials
  if (users[username] && users[username] === password) {
    setIsLoggedIn(true);
    setUsername(username);

     
      // Store login state in local storage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);

    const userPath = userPaths[username];
    if (userPath) {
      const userRef = ref(database, 'current-user');
      set(userRef, username);
    }
  } else {
    alert('Invalid username or password. Please try again.');
  }
};

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');


    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');

    const userRef = ref(database, 'current-user');
    set(userRef, '');
  };



  useEffect(() => {
    // Check local storage for login state on component mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');

    if (loggedIn && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);


  useEffect(() => {
    if (isLoggedIn) {
      const userPath = userPaths[username];
      if (userPath) {
        const rfidRef = ref(database, userPath.rfidReaderPath);

        const rfidUnsubscribe = onValue(rfidRef, (snapshot) => {
          const readerData = snapshot.val();
          if (readerData) {
            setStartingAisle(readerData);
            setShowDropdown(true);
          }
        });

        return () => {
          rfidUnsubscribe();
        };
      }
    }
  }, [isLoggedIn, username]);


  useEffect(() => {
    if (startingAisle && selectedItem && canvasRef.current) {
      drawPath();
    } else {
      clearPath();
    }
  }, [startingAisle, selectedItem]);
  useEffect(() => {
    // Function to handle Firebase updates
    const updateAislePath = (path) => {
      const pathRef = ref(database, path);
      
      // Set the path to 'ON' for 4 seconds
      set(pathRef, 'ON');
      
      // // After 4 seconds, set it to 'OFF' for 1 second
      // setTimeout(() => {
      //   set(pathRef, 'OFF');
        
      //   // After 1 second, reset the path to 'IDLE' (or any neutral state)
      //   setTimeout(() => {
      //     set(pathRef, 'IDLE'); // or 'IDLE'
      //   }, 0.0001); // Delay before resetting to 'IDLE'
      // }, 10000); // ON for 4 seconds
    };
  
    if (selectedItem === '1.1') {
      console.log('Apples selected');
      updateAislePath('aisle1_1');
    } else if (selectedItem === '1.2') {
      console.log('1.2 selected');
      updateAislePath('aisle1_2');
    }else if (selectedItem === '1.3') {
      console.log('1.3 selected');
      updateAislePath('aisle1_3');
    }else if (selectedItem === '2.1') {
      console.log('2.1 selected');
      updateAislePath('aisle2_1');
    }else if (selectedItem === '2.2') {
      console.log('2.2 selected');
      updateAislePath('aisle2_2');
    }else if (selectedItem === '2.3') {
      console.log('2.3 selected');
      updateAislePath('aisle2_3');
    }
    else if (selectedItem === '3.1') {
      console.log('3.1 selected');
      updateAislePath('aisle3_1');
    }else if (selectedItem === '3.2') {
      console.log('3.2 selected');
      updateAislePath('aisle3_2');
    }else if (selectedItem === '3.3') {
      console.log('3.3 selected');
      updateAislePath('aisle3_3');
    }
  }, [selectedItem]);
  const drawPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const supermarket = document.getElementById('supermarket');
    const aisleElement = aisleRefs.current[startingAisle];
    const itemElement = document.getElementById(`item${selectedItem.replace('.', '-')}`);

    if (!canvas || !ctx || !aisleElement || !itemElement) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const aisleRect = aisleElement.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();
    const supermarketRect = supermarket.getBoundingClientRect();

    const aisleX = aisleRect.left - supermarketRect.left + (aisleElement.offsetWidth / 2);
    const aisleY = aisleRect.top - supermarketRect.top + (aisleElement.offsetHeight / 2);
    const itemX = itemRect.left - supermarketRect.left + (itemElement.offsetWidth / 2);
    const itemY = itemRect.top - supermarketRect.top + (itemElement.offsetHeight / 2);

    // Determine if the device is a phone or PC
    const isPhone = window.innerWidth <= 768;  // Consider screens less than or equal to 768px width as phones

    let aislePadding = isPhone ? 140 : 180;  // Default padding for phone or PC

    // Determine the aisle numbers
    const startingAisleNumber = parseInt(startingAisle);
    const targetAisleNumber = parseInt(selectedItem.match(/\d+/)[0]);

    // If moving between aisle 1 and 3, adjust padding for PC and phone
    if ((startingAisleNumber === 1 && targetAisleNumber === 3) || 
        (startingAisleNumber === 3 && targetAisleNumber === 1)) {
        aislePadding = isPhone ? 270 : 390;
    }

    ctx.beginPath();
    ctx.moveTo(aisleX, aisleY);  // Start at the starting aisle

    // Draw label "Reader 1", "Reader 2", or "Reader 3" based on the aisle
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000'; // Text color

    if (startingAisleNumber === 1) {
        ctx.fillText('Reader 1', aisleX - 20, aisleY - 10);
    } else if (startingAisleNumber === 2) {
        ctx.fillText('Reader 2', aisleX - 20, aisleY - 10);
    } else if (startingAisleNumber === 3) {
        ctx.fillText('Reader 3', aisleX - 20, aisleY - 10);
    }

    // If the item is in the same aisle (i.e., similar X coordinates), move straight
    if (Math.abs(itemX - aisleX) < 98) {
        // Draw a straight line vertically to the item
        ctx.lineTo(itemX, itemY);
    } else {
        // If the item is not in the same aisle, move around the aisles
        if (itemX > aisleX) {
            // Move horizontally to the right
            ctx.lineTo(aisleX + aislePadding, aisleY); // Horizontal move to the right
            ctx.lineTo(aisleX + aislePadding, itemY);  // Vertical move down/up
        } else {
            // Move horizontally to the left
            ctx.lineTo(aisleX - aislePadding, aisleY); // Horizontal move to the left
            ctx.lineTo(aisleX - aislePadding, itemY);  // Vertical move down/up
        }

        // Finally, move horizontally to the item
        ctx.lineTo(itemX, itemY);
    }

    ctx.strokeStyle = '#28a745';  // Green line color
    ctx.lineWidth = 3;
    ctx.stroke();
};



  const clearPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  
  const handleFindItem = () => {
    if (selectedItem) {
      const aislePath = `aisle${selectedItem.replace('.', '_')}`;
      const pathRef = ref(database, aislePath);

      // Set the aisle to 'OFF'
      set(pathRef, 'OFF').then(() => {
        // Draw the path after setting the value to 'OFF'
        drawPath();
      }).catch((error) => {
        console.error("Error updating Firebase:", error);
      });
    }
  };


  const handleReadStartingAisle = () => {
    const userPath = userPaths[username];
    if (userPath) {
      const rfidRef = ref(database, userPath.rfidReaderPath);
      onValue(rfidRef, (snapshot) => {
        const readerData = snapshot.val();
        if (readerData) {
          setStartingAisle(readerData);
          setShowDropdown(false);
          
          const pathRef = ref(database, userPath.path);
          set(pathRef, 'YES');
        }
      });
    }
  };

  return (
    <div className="App">
    {!isLoggedIn && ( // Only show header if not logged in
    <header className="text-center mb-4" style={{ marginTop: '7%' }}>
      <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt="EasyMart MALL Logo" style={{ width: '150px' }} />
      <h1>EasyMart MALL Navigation</h1>
    </header>
  )}

      {!isLoggedIn ? (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div style={{ maxWidth: '90%', width: '90%', marginTop: window.innerWidth < 768 ? '-90%' : '-30%' }}>
    <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="login-username" className="form-label">Username</label>
                <input type="text" className="form-control" id="login-username" name="username" required />
              </div>
              <div className="mb-3">
                <label htmlFor="login-password" className="form-label">Password</label>
                <input type="password" className="form-control" id="login-password" name="password" required />
              </div>
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          <h2>Welcome, {username}</h2>
          <h2>Find Your Item</h2>
          <div>
            <label htmlFor="starting-aisle">Select Starting Aisle:</label>
            <div>
              <input
                type="text"
                id="starting-aisle"
                value={startingAisle}
                readOnly
                placeholder="Select Starting Aisle"
              />
              <button onClick={handleReadStartingAisle}>Read Starting Aisle</button>
            </div>
          </div>
          <div>
            <label htmlFor="item-selector">Select Item:</label>
            <select
              id="item-selector"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">Select an item</option>
              <option value="1.1">Aisle 1, Apples</option>
              <option value="1.2">Aisle 1, Bananas</option>
              <option value="1.3">Aisle 1, Oranges</option>
              <option value="2.1">Aisle 2, Bread</option>
              <option value="2.2">Aisle 2, Milk</option>
              <option value="2.3">Aisle 2, Cheese</option>
              <option value="3.1">Aisle 3, Shampoo</option>
              <option value="3.2">Aisle 3, Soap</option>
              <option value="3.3">Aisle 3, Toothpaste</option>
            </select>

            <button
      className="btn btn-secondary ms-2"
      style={{ height: '27px', padding: '0 10px' }}  // Adjust height and padding

      onClick={() => setSelectedItem('')}
    >
      Reset
    </button>
          </div>
          <div id="supermarket" class="supermarket">
          <div
              id="aisle1"
              className="aisle"
              ref={(el) => (aisleRefs.current['1'] = el)}
              style={{ backgroundColor: '#f4f4f4', position: 'relative' }}
            >
              <div className="item" style={{ top: '20px', left: '20px' }} id="item1-1"></div>
              <div className="item" style={{ top: '100px', left: '20px' }} id="item1-2"></div>
              <div className="item" style={{ top: '180px', left: '20px' }} id="item1-3"></div>
            </div>
            <div
              id="aisle2"
              className="aisle"
              ref={(el) => (aisleRefs.current['2'] = el)}
              style={{ backgroundColor: '#f4f4f4', position: 'relative' }}
            >
              <div className="item" style={{ top: '20px', left: '20px' }} id="item2-1"></div>
              <div className="item" style={{ top: '100px', left: '20px' }} id="item2-2"></div>
              <div className="item" style={{ top: '180px', left: '20px' }} id="item2-3"></div>
            </div>
            <div
              id="aisle3"
              className="aisle"
              ref={(el) => (aisleRefs.current['3'] = el)}
              style={{ backgroundColor: '#f4f4f4', position: 'relative' }}
            >
              <div className="item" style={{ top: '20px', left: '20px' }} id="item3-1"></div>
              <div className="item" style={{ top: '100px', left: '20px' }} id="item3-2"></div>
              <div className="item" style={{ top: '180px', left: '20px' }} id="item3-3"></div>
            </div>
            <canvas ref={canvasRef} width="600" height="400" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}></canvas>
          </div>
        </div>
      )}


<style jsx>{`
        @media only screen and (max-width: 768px) {
          canvas.canvastest {
            width: 380px !important;
          }
        }
      `}</style>





    </div>




  );
}

export default App;
