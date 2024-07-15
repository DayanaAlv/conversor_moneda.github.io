let chartInstance;

document.getElementById('convertButton').addEventListener('click', convertCurrency);

async function convertCurrency() {
  const amount = document.getElementById('amount').value;
  const currency = document.getElementById('currency').value;
  const resultElement = document.getElementById('result');
  const chartElement = document.getElementById('myChart').getContext('2d');

  if (amount === '') {
    resultElement.textContent = 'Por favor ingresa un monto en CLP.';
    return;
  }

  try {
    const response = await fetch(`https://mindicador.cl/api/${currency}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    const exchangeRate = data.serie[0].valor;
    const convertedAmount = (amount / exchangeRate).toFixed(2);

    resultElement.textContent = `${amount} CLP son aproximadamente ${convertedAmount} ${currency.toUpperCase()}`;

    const historicalData = data.serie.slice(0, 10).reverse();
    const labels = historicalData.map(entry => entry.fecha.slice(0, 10));
    const values = historicalData.map(entry => entry.valor);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `Historial de ${currency.toUpperCase()} en los últimos 10 días`,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valor'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Detalles del error:', error);
    useOfflineData(amount, currency, resultElement, chartElement);
  }
}

async function useOfflineData(amount, currency, resultElement, chartElement) {
  try {
    const response = await fetch('offline.json');
    const offlineData = await response.json();
    const exchangeRate = offlineData[currency].valor;
    const convertedAmount = (amount / exchangeRate).toFixed(2);

    resultElement.textContent = `${amount} CLP son aproximadamente ${convertedAmount} ${currency.toUpperCase()} (Datos Offline)`;

    const historicalData = offlineData[currency].historical.slice(0, 10).reverse();
    const labels = historicalData.map(entry => entry.fecha.slice(0, 10));
    const values = historicalData.map(entry => entry.valor);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `Historial de ${currency.toUpperCase()} en los últimos 10 días (Datos Offline)`,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valor'
            }
          }
        }
      }
    });
  } catch (offlineError) {
    resultElement.textContent = 'Hubo un error al realizar la conversión. Por favor, inténtalo de nuevo más tarde.';
    console.error('Detalles del error offline:', offlineError);
  }
}
