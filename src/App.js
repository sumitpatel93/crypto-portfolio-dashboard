import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, TextField, Button } from '@mui/material';
import './App.css';

// Function to fetch token data based on wallet address
const fetchTokenData = async (walletAddress) => {
  const apiUrl = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=eth`;
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImQwY2M4OGQ3LWM2MjQtNDI2NS1iYTgxLWNlMzA3MzQwY2ZjNSIsIm9yZ0lkIjoiNDE2ODkxIiwidXNlcklkIjoiNDI4NTUyIiwidHlwZUlkIjoiZGQ4OGZmZGYtYTNiYS00YTAyLWE2MDEtMTJlOWQ2YzNhNTI4IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MzIwODc4NTUsImV4cCI6NDg4Nzg0Nzg1NX0.eQcZmDbhkTrlSPm5eWLmd98V3zLKb43ffzLVLfuVYWc' // Replace with your actual API key
      }
    });
    return response.data.result;
  } catch (error) {
    console.error("Error fetching token data:", error);
    return [];
  }
};

/**
 * App component that displays a cryptocurrency portfolio.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * return <App />;
 * 
 * @description
 * This component allows users to enter a wallet address and fetches the token data associated with that address.
 * It displays the total portfolio value and a table of tokens with their details such as logo, name, symbol, balance, price, value, and portfolio percentage.
 * The token data is refreshed every 10 minutes.
 * 
 * @typedef {Object} Token
 * @property {string} logo - The URL of the token's logo.
 * @property {string} name - The name of the token.
 * @property {string} symbol - The symbol of the token.
 * @property {string} balance_formatted - The formatted balance of the token.
 * @property {number} usd_price - The price of the token in USD.
 * @property {number} usd_value - The value of the token in USD.
 * @property {number} portfolio_percentage - The percentage of the token in the portfolio.
 * 
 * @state {Array<Token>} tokens - The list of tokens in the portfolio.
 * @state {boolean} loading - The loading state while fetching token data.
 * @state {number} totalValue - The total value of the portfolio in USD.
 * @state {string} walletAddress - The wallet address entered by the user.
 * @state {number} refreshInterval - The interval for refreshing token data in milliseconds.
 * 
 * @function handleSubmit - Fetches token data when the user submits a wallet address.
 * @function calculateTotalValue - Calculates the total value of the portfolio.
 * 
 * @useEffect Sets an interval to refresh token data every 10 minutes.
 */



const App = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0); // Total portfolio value in USD
  const [walletAddress, setWalletAddress] = useState(""); // State to store wallet address entered by user
  const [refreshInterval, setRefreshInterval] = useState(600000); // 10 minutes in milliseconds

  // Fetch token data on wallet address change
  const handleSubmit = async () => {
    if (walletAddress.trim() !== "") {
      setLoading(true);
      const tokenData = await fetchTokenData(walletAddress);
      setTokens(tokenData);
      setLoading(false);
      calculateTotalValue(tokenData); // Calculate portfolio value after fetching data
    }
  };

  // Calculate total portfolio value
  const calculateTotalValue = (tokenData) => {
    const total = tokenData.reduce((acc, token) => {
      const tokenValue = parseFloat(token.usd_value || 0);
      return acc + tokenValue;
    }, 0);
    setTotalValue(total);
  };

  // Set interval for price update every 10 minutes (600000ms)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (walletAddress.trim() !== "") {
        const updatedTokenData = await fetchTokenData(walletAddress);
        setTokens(updatedTokenData);
        calculateTotalValue(updatedTokenData);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [walletAddress]);

  return (
    <div className="container">
      <Typography variant="h4" component="h1" className="title" align="center">
        Token Portfolio
      </Typography>

      {/* Wallet Address Input and Submit Button */}
      <Box display="flex" justifyContent="center" marginBottom={2}>
        <TextField
          label="Enter Wallet Address"
          variant="outlined"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          fullWidth
          style={{ maxWidth: '400px' }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          style={{ marginLeft: '10px' }}
        >
          Submit
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" align="center" style={{ marginBottom: '20px' }}>
            Total Portfolio Value: ${totalValue.toFixed(2)}
          </Typography>

          <TableContainer component={Paper}>
            <Table aria-label="tokens table">
              <TableHead>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Price (USD)</TableCell>
                  <TableCell>Value (USD)</TableCell>
                  <TableCell>Portfolio Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {token.logo ? (
                        <img src={token.logo} alt={token.name} style={{ width: '30px', height: '30px' }} />
                      ) : (
                        <span>No Logo</span>
                      )}
                    </TableCell>
                    <TableCell>{token.name}</TableCell>
                    <TableCell>{token.symbol}</TableCell>
                    <TableCell>{token.balance_formatted}</TableCell>
                    <TableCell>${token.usd_price ? token.usd_price.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>${token.usd_value ? token.usd_value.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{token.portfolio_percentage ? token.portfolio_percentage.toFixed(2) + '%' : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default App;
