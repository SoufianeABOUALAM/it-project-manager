import React from 'react';

const TestDashboard = () => {
    console.log('🧪 TestDashboard component is rendering!');
    
    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: 'lightgreen', 
            minHeight: '200px',
            border: '3px solid red'
        }}>
            <h1 style={{ color: 'red', fontSize: '2em' }}>
                🧪 TEST DASHBOARD WORKS! 🧪
            </h1>
            <h2 style={{ color: 'blue' }}>
                This is a test component to verify routing works.
            </h2>
            <button 
                style={{ 
                    padding: '10px 20px', 
                    fontSize: '16px', 
                    backgroundColor: 'blue', 
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    console.log('🧪 Test button clicked!');
                    alert('Test component works!');
                }}
            >
                Test Button
            </button>
        </div>
    );
};

export default TestDashboard;
