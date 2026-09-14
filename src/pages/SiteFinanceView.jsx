import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import {
  DollarSign,
  PlusCircle,
  Building2,
  Calendar,
  Filter,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle,
  X
} from 'lucide-react';

export const SiteFinanceView = () => {
  const { user, role } = useAuth();
  const { assignedSites, activeSiteId, setActiveSiteId } = useSite();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalMaterialAmount: 0,
    totalDebitAmount: 0,
    totalCreditAmount: 0,
    netBalance: 0,
  });
  const [selectedSiteId, setSelectedSiteId] = useState(activeSiteId || 'ALL');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Excel Modal State
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [importSiteId, setImportSiteId] = useState('');

  // Form Fields
  const [siteId, setSiteId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [material, setMaterial] = useState('');
  const [amount, setAmount] = useState('');
  const [debitName, setDebitName] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [creditName, setCreditName] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFinanceData();
  }, [selectedSiteId]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const url = selectedSiteId && selectedSiteId !== 'ALL'
        ? `/site-finance?siteId=${selectedSiteId}`
        : '/site-finance';
      const res = await api.get(url);
      setTransactions(res.data.transactions || []);
      setSummary(res.data.summary || {
        totalMaterialAmount: 0,
        totalDebitAmount: 0,
        totalCreditAmount: 0,
        netBalance: 0,
      });
    } catch (err) {
      console.error('Error fetching site finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setSiteId(tx.siteId?._id || tx.siteId || '');
      setDate(tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setMaterial(tx.material || '');
      setAmount(tx.amount || '');
      setDebitName(tx.debitName || '');
      setDebitAmount(tx.debitAmount || '');
      setCreditName(tx.creditName || '');
      setCreditAmount(tx.creditAmount || '');
      setRemark(tx.remark || '');
    } else {
      setEditingTx(null);
      setSiteId(selectedSiteId !== 'ALL' ? selectedSiteId : (assignedSites[0]?._id || ''));
      setDate(new Date().toISOString().split('T')[0]);
      setMaterial('');
      setAmount('');
      setDebitName('');
      setDebitAmount('');
      setCreditName('');
      setCreditAmount('');
      setRemark('');
    }
    setShowModal(true);
  };

  const parseExcelDate = (val) => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'number') {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    const str = String(val).trim();
    // Check DD-MM-YYYY or DD/MM/YYYY
    const dmYMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmYMatch) {
      const day = dmYMatch[1].padStart(2, '0');
      const month = dmYMatch[2].padStart(2, '0');
      const year = dmYMatch[3];
      return `${year}-${month}-${day}`;
    }
    // Check YYYY-MM-DD
    const YmdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (YmdMatch) {
      const year = YmdMatch[1];
      const month = YmdMatch[2].padStart(2, '0');
      const day = YmdMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleDownloadSample = () => {
    const activeSiteName = assignedSites.find(s => s._id === selectedSiteId)?.name || 'Main Site';
    const sampleData = [
      {
        'Sl No': 1,
        'Date': '2026-09-14',
        'Material': 'Steel TMT 12mm',
        'Amount': 45000,
        'Debit Name': 'Anku kumari',
        'Debit Amount': 45000,
        'Credit Name': 'Agarwal Steel Corp',
        'Credit Amount': 0,
        'Site Name': activeSiteName,
        'Remark': 'Advance payment for structural steel'
      },
      {
        'Sl No': 2,
        'Date': '2026-09-14',
        'Material': 'Ultratech Cement',
        'Amount': 28000,
        'Debit Name': 'Santosh mishra',
        'Debit Amount': 0,
        'Credit Name': 'Mishra Building Depot',
        'Credit Amount': 28000,
        'Site Name': activeSiteName,
        'Remark': 'Paid against Bill #9042'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Site Finance Ledger");
    XLSX.writeFile(wb, "Site_Finance_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Parse sheet as 2D array to locate table header row dynamically
        const rawGrid = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (rawGrid.length === 0) {
          alert('The uploaded Excel file is empty.');
          return;
        }

        // Find header row index by scanning first 15 rows for column headers
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawGrid.length, 15); i++) {
          const row = rawGrid[i];
          if (Array.isArray(row)) {
            const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
            if (
              (rowStr.includes('sl no') || rowStr.includes('sl.no') || rowStr.includes('slno') || rowStr.includes('date')) &&
              (rowStr.includes('debit') || rowStr.includes('credit') || rowStr.includes('material') || rowStr.includes('site'))
            ) {
              headerRowIndex = i;
              break;
            }
          }
        }

        let headerNames = [];
        let dataRows = [];

        if (headerRowIndex !== -1) {
          headerNames = rawGrid[headerRowIndex].map(h => String(h || '').trim());
          dataRows = rawGrid.slice(headerRowIndex + 1);
        } else {
          // Fallback if no header banner row found
          headerNames = Object.keys(XLSX.utils.sheet_to_json(ws)[0] || {});
          dataRows = rawGrid.slice(1);
        }

        const parsedRows = [];
        dataRows.forEach((row, idx) => {
          if (!Array.isArray(row) || row.every(cell => cell === '' || cell === null || cell === undefined)) return;

          // Helper to locate cell by matching header name
          const findVal = (keys) => {
            for (let kIdx = 0; kIdx < headerNames.length; kIdx++) {
              const hName = headerNames[kIdx].toLowerCase();
              if (keys.some(k => hName === k.toLowerCase() || hName.includes(k.toLowerCase()))) {
                return row[kIdx] !== undefined ? row[kIdx] : '';
              }
            }
            return '';
          };

          const rawSl = findVal(['Sl no', 'Sl.no', 'Sl', 'S.No']);
          const rawDate = findVal(['Date', 'Tx Date', 'Transaction Date']);
          const material = findVal(['Material', 'Item', 'Particulars']);
          const amount = parseFloat(findVal(['Amount', 'Material Amount', 'Cost']) || 0);
          const debitName = findVal(['Debit Name', 'DebitBy', 'Debit']);
          const debitAmount = parseFloat(findVal(['Debit Amount', 'DebitAmt']) || 0);
          const creditName = findVal(['Credit Name', 'CreditBy', 'Credit']);
          const creditAmount = parseFloat(findVal(['Credit Amount', 'CreditAmt']) || 0);
          const siteName = findVal(['Site Name', 'Site']);
          const remark = findVal(['Remark', 'Remarks', 'Note', 'Notes']);

          // Ignore row if it's completely empty of financial details
          if (!rawDate && !material && !debitName && !creditName && !debitAmount && !creditAmount && !amount) return;

          let targetSiteId = selectedSiteId !== 'ALL' ? selectedSiteId : (assignedSites[0]?._id || '');
          if (siteName && String(siteName).trim() !== '0') {
            const cleanSiteName = String(siteName).trim().toLowerCase();
            const matched = assignedSites.find(s =>
              s.name.trim().toLowerCase() === cleanSiteName ||
              cleanSiteName.includes(s.name.trim().toLowerCase()) ||
              s.name.trim().toLowerCase().includes(cleanSiteName)
            );
            if (matched) targetSiteId = matched._id;
          }

          parsedRows.push({
            slNo: rawSl || (parsedRows.length + 1),
            siteId: targetSiteId,
            siteName: siteName || assignedSites.find(s => s._id === targetSiteId)?.name || 'Default Site',
            date: parseExcelDate(rawDate),
            material: String(material || ''),
            amount: isNaN(amount) ? 0 : amount,
            debitName: String(debitName || ''),
            debitAmount: isNaN(debitAmount) ? 0 : debitAmount,
            creditName: String(creditName || ''),
            creditAmount: isNaN(creditAmount) ? 0 : creditAmount,
            remark: String(remark || '')
          });
        });

        if (parsedRows.length === 0) {
          alert('No valid transaction rows found in Excel sheet.');
          return;
        }

        setExcelPreviewData(parsedRows);
        setImportSiteId(selectedSiteId !== 'ALL' ? selectedSiteId : (assignedSites[0]?._id || ''));
        setShowExcelModal(true);
      } catch (err) {
        console.error('Error reading excel file:', err);
        alert('Failed to parse Excel file. Please upload a valid .xlsx or .xls file.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset file input
  };

  const handleImportExcelData = async () => {
    if (excelPreviewData.length === 0) return;
    setSubmitting(true);
    try {
      const targetSite = importSiteId || (selectedSiteId !== 'ALL' ? selectedSiteId : assignedSites[0]?._id);
      const payload = {
        siteId: targetSite,
        transactions: excelPreviewData
      };
      await api.post('/site-finance/batch', payload);
      alert(`Successfully imported ${excelPreviewData.length} records!`);
      setShowExcelModal(false);
      setExcelPreviewData([]);
      fetchFinanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import Excel records');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        siteId,
        date,
        material,
        amount: amount ? parseFloat(amount) : 0,
        debitName,
        debitAmount: debitAmount ? parseFloat(debitAmount) : 0,
        creditName,
        creditAmount: creditAmount ? parseFloat(creditAmount) : 0,
        remark,
      };

      if (editingTx) {
        await api.put(`/site-finance/${editingTx._id}`, payload);
      } else {
        await api.post('/site-finance', payload);
      }

      setShowModal(false);
      fetchFinanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save finance record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await api.delete(`/site-finance/${id}`);
      fetchFinanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        Loading Site Finance Ledger...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileSpreadsheet color="#2563eb" size={22} /> Site Account Payment Ledger
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
              Real-time payment tracking, material costs, debit & credit ledger per site.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <Building2 size={14} color="#2563eb" />
              <select
                className="input-field"
                style={{ width: 'auto', minHeight: '32px', fontSize: '0.8rem', border: 'none', background: 'transparent' }}
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                <option value="ALL">All Assigned Sites</option>
                {assignedSites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-secondary" onClick={handleDownloadSample} title="Download Sample Excel Sheet">
              <Download size={15} /> Sample Excel
            </button>

            <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={15} color="#2563eb" /> Upload Excel File
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>
              <PlusCircle size={15} /> Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Summary Rollup Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Material Amount</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginTop: '0.1rem' }}>
            ₹{summary.totalMaterialAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Debited Amount</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#059669', marginTop: '0.1rem' }}>
            ₹{summary.totalDebitAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Credited Amount</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#dc2626', marginTop: '0.1rem' }}>
            ₹{summary.totalCreditAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Net Ledger Balance</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: summary.netBalance >= 0 ? '#2563eb' : '#dc2626', marginTop: '0.1rem' }}>
            ₹{summary.netBalance.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Account Payment Table (Desktop & Tablet) */}
      <div className="card table-responsive" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '0.6rem 0.5rem', width: '40px', textAlign: 'center' }}>Sl</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Date</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Material</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Amount</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Debit Name</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Debit Amount</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Credit Name</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Credit Amount</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Site Name</th>
              <th style={{ padding: '0.6rem 0.5rem' }}>Remark</th>
              <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No payment records found. Click "Upload Excel File" or "Add Record" to create one.
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => {
                const txDate = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

                return (
                  <tr key={tx._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 500 }}>{txDate}</td>
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600, color: '#2563eb' }}>{tx.material || '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600 }}>{tx.amount ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem' }}>{tx.debitName || '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', color: '#059669', fontWeight: 600 }}>{tx.debitAmount ? `₹${tx.debitAmount.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem' }}>{tx.creditName || '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', color: '#dc2626', fontWeight: 600 }}>{tx.creditAmount ? `₹${tx.creditAmount.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 500 }}>{tx.siteId?.name || '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', color: '#64748b', fontSize: '0.78rem' }}>{tx.remark || '-'}</td>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenModal(tx)}
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '2px' }}
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx._id)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EXCEL PREVIEW & IMPORT MODAL */}
      {showExcelModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <UploadCloud color="#2563eb" size={20} /> Preview Parsed Excel File Data ({excelPreviewData.length} records)
              </h3>
              <button onClick={() => setShowExcelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label>Target Site for Batch Import *</label>
              <select
                className="input-field"
                value={importSiteId}
                onChange={(e) => setImportSiteId(e.target.value)}
                required
              >
                <option value="">-- Choose Target Construction Site --</option>
                {assignedSites.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', stickyTop: 0 }}>
                    <th style={{ padding: '0.4rem' }}>Sl</th>
                    <th style={{ padding: '0.4rem' }}>Date</th>
                    <th style={{ padding: '0.4rem' }}>Material</th>
                    <th style={{ padding: '0.4rem' }}>Amount</th>
                    <th style={{ padding: '0.4rem' }}>Debit Name</th>
                    <th style={{ padding: '0.4rem' }}>Debit Amount</th>
                    <th style={{ padding: '0.4rem' }}>Credit Name</th>
                    <th style={{ padding: '0.4rem' }}>Credit Amount</th>
                    <th style={{ padding: '0.4rem' }}>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.4rem', textAlign: 'center' }}>{row.slNo}</td>
                      <td style={{ padding: '0.4rem' }}>{row.date}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 600 }}>{row.material || '-'}</td>
                      <td style={{ padding: '0.4rem' }}>₹{row.amount}</td>
                      <td style={{ padding: '0.4rem' }}>{row.debitName || '-'}</td>
                      <td style={{ padding: '0.4rem', color: '#059669' }}>₹{row.debitAmount}</td>
                      <td style={{ padding: '0.4rem' }}>{row.creditName || '-'}</td>
                      <td style={{ padding: '0.4rem', color: '#dc2626' }}>₹{row.creditAmount}</td>
                      <td style={{ padding: '0.4rem', color: '#64748b' }}>{row.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowExcelModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleImportExcelData} disabled={submitting || !importSiteId}>
                {submitting ? 'Importing...' : `Confirm & Import ${excelPreviewData.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TRANSACTION MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileSpreadsheet color="#2563eb" size={18} /> {editingTx ? 'Edit Account Payment Record' : 'Add Account Payment Record'}
            </h3>

            <form onSubmit={handleSaveTransaction}>
              <div className="input-group">
                <label>Construction Site *</label>
                <select
                  className="input-field"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Site --</option>
                  {assignedSites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Transaction Date *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Material Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Steel TMT, Cement"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Material Cost Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Debit Name (Payer)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Anku kumari"
                    value={debitName}
                    onChange={(e) => setDebitName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Debit Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="0.00"
                    value={debitAmount}
                    onChange={(e) => setDebitAmount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Credit Name (Receiver/Vendor)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Santosh mishra, Agarwal Traders"
                    value={creditName}
                    onChange={(e) => setCreditName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Credit Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="0.00"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Remark / Notes</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Invoice #104, Thikdaar payment"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Payment Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

