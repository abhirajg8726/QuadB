document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/tickers')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#tickers-table tbody');
        data.forEach((ticker, index) => {
          const row = document.createElement('tr');
          const diffClass = ticker.difference > 0 ? 'green' : 'red';
          const savingsClass = ticker.savings > 0 ? 'green' : 'red';
  
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${ticker.platform}</td>
            <td>₹${ticker.last_traded_price}</td>
            <td>₹${ticker.buy_price} / ₹${ticker.sell_price}</td>
            <td class="${diffClass}">${ticker.difference.toFixed(2)}%</td>
            <td class="${savingsClass}">₹${ticker.savings.toFixed(2)}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching data:', err));
  });
  