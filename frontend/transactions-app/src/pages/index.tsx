import { useState, useEffect } from 'react';
import axios from 'axios';
import Styles from './styles.module.css';
import Header from './components/header/header';
import Loader from './components/sub-components/loader';

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ cpfCnpj  : '', startDate: '', endDate: '' });
  const [showTable, setShowTable] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const fetchTransactions = async (page = 1) => {
    try {
      const { cpfCnpj, startDate, endDate } = filters;
      const response = await axios.get('http://localhost:3000/transactions', {
        params: { page, cpfCnpj, startDate, endDate },
      });
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
      if(response){
        setShowSpinner(false);
        setShowTable(true);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if(error.status === 404){
        setTransactions(error.response.data.transactions)          
      }
      console.error('Error fetching transactions', error);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageUpdate = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFileUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    setShowSpinner(true);
    setShowTable(false);
    e.preventDefault();

    if (!file) {
      setMessage('Selecione o arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('transacoes', file);

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      setMessage(`${response.data.message} tempo de duração: ${response.data.runTime}ms`);
      fetchTransactions();
    } catch (error) {
      console.error(error);
      setMessage('Error uploading file.');
    }
  };

  return (
    <div className={Styles.mainContainer}>
      <Header />

      {/* Upload file section */}
      <div className={Styles.formBox}>
        <form onSubmit={handleUpload}>
          <label>Enviar arquivo (TXT): </label>
          <input type="file" onChange={handleFileUpdate} />
          <button type="submit">Enviar</button>
          
        </form>
        {showSpinner && (
          <div className={Styles.spinner}>
            <Loader />
          </div>
        )}
        {message && <p>{message}</p>}
      </div>
      
      {/* Filters section */}
      <div className={Styles.formfilters}>
        <label>CPF/CNPJ do cliente: </label>
        <input
          type="text"
          name="cpfCnpj"
          value={filters.cpfCnpj}
          onChange={handleFilterUpdate}
        />
        <label>Desde: </label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterUpdate}
        />
        <label>Até: </label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterUpdate}
        />
        <button onClick={() => fetchTransactions(1)}>Aplicar filtros</button>
      </div>

      {/* Table section */}
      <div className={Styles.tableBox}>
        <h2>TRANSAÇÕES</h2>
        {showTable && (
          <table border={1} cellPadding="10" cellSpacing="0" style={{ width: '100%', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do cliente</th>
                <th>CPF/CNPJ</th>
                <th>Data</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {transactions.map((transaction: any) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.clienteId.nome}</td>
                  <td>{transaction.clienteId.cpfCnpj}</td>
                  <td>{new Date(transaction.data).toISOString().split('T')[0]}</td>
                  <td>{transaction.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginator section */}
      {showTable && (
        <div className={Styles.pagination}>
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageUpdate(currentPage - 1)}
          className={`${Styles.pageButton} ${currentPage === 1 ? Styles.disabled : ''}`}
        >
          Anterior
        </button>

        <span className={Styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageUpdate(currentPage + 1)}
          className={`${Styles.pageButton} ${currentPage === totalPages ? Styles.disabled : ''}`}
        >
          Próxima
        </button>
      </div>
      )}
      
    </div>
  );
};

export default Dashboard;
