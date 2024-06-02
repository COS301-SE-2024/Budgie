export function processFileContent(content) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
    let balance = null;
    let transactionsData = [];
  
    // Find the line that contains the balance
    const balanceLine = lines.find(line => line.startsWith('Balance:'));
    if (balanceLine) {
      const balanceValues = balanceLine.split(',').map(value => value.trim()).filter(value => value);
      if (balanceValues.length > 1) {
        balance = parseFloat(balanceValues[1]);
      }
    }
  
    // Find the line that contains the transaction headers
    const headerLine = lines.find(line => line.startsWith('Date'));
    if (headerLine) {
      for (let i = lines.indexOf(headerLine) + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === ',,,') {
          break; // Stop reading if encountered an empty line
        }
        const [date, amount, balance, description] = line.split(',');
        transactionsData.push({
          date,
          amount: parseFloat(amount),
          balance: parseFloat(balance),
          description
        });
      }
    }
  
    return { balance, transactionsData };
  }
  