import axios from 'axios';

interface Transaction {
  isError: string;
  txreceipt_status: string;
}

interface BasescanResponse {
  status: string | number; 
  message: string;
  result: Transaction[];
}

export async function getFilteredTransactions(address: string, apiKey: string): Promise<number> {
  const url = `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${apiKey}`;

  try {
    const response = await axios.get<BasescanResponse>(url);
    
    // console.log('Full API response:', response.data);

    if (response.data.status !== '1' && response.data.status !== 1) {
      console.error('API Error:', response.data.message);
      throw new Error(`API Error: ${response.data.message}`);
    }

    const filteredTransactions = response.data.result.filter(tx => 
      tx.isError === '0' && tx.txreceipt_status === '1'
    );

    console.log('Filtered transactions count:', filteredTransactions.length);
    return filteredTransactions.length;
  } catch (error: any) {

    console.error('Error fetching or processing transactions:', error.message);
    console.log('Error details:', error.response ? error.response.data : error);
    return 0;
  }
}

const address = '0x6f83585Ec485FE6bcDB7e4080eB6731C11813A65'; 
const apiKey = 'H4TPWFCD9FCZIVSPRVF3RBZFYASMBBSQ6Y'; 

getFilteredTransactions(address, apiKey)
  .then(count => console.log(`Number of successful transactions: ${count}`))
  .catch(error => console.error('Error:', error));
