import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, FaPlus, FaTrash, FaDownload, 
  FaTimes, FaCheckSquare, FaSquare, FaExclamationCircle, FaSave 
} from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ConfirmationModal from './ConfirmationModal';
import './MinutesInfo.css';

const MinutesInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fileId = location.state?.fileId || 'new';

  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [caseData, setCaseData] = useState({ docketNo: "", matter: "" });
  const [conferences, setConferences] = useState([{
    date: "",
    time: "",
    requestingParties: ["", "", ""],
    respondingParties: ["", "", ""],
    concerns: "",
    status: "",
    paymentType: "",
    amountPaid: "0",
    totalAmount: ""
  }]);

  const formatParties = (partyData) => {
    if (!partyData) return ["", "", ""];
    const names = typeof partyData === 'string'
      ? partyData.split(',').map(n => n.trim()).filter(n => n !== "")
      : Array.isArray(partyData) ? partyData.filter(n => n && n.trim() !== "") : [partyData];
    while (names.length < 3) names.push("");
    return names;
  };

  const formatTo24Hour = (timeStr) => {
    if (!timeStr) return "";
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const modifier = match[3].toUpperCase();
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const buildDateFromSchedule = (scheduleData) => {
    if (scheduleData?.year && scheduleData?.monthName && scheduleData?.day) {
      const monthIndex = new Date(Date.parse(scheduleData.monthName + " 1, 2000")).getMonth();
      const dateObj    = new Date(parseInt(scheduleData.year), monthIndex, parseInt(scheduleData.day));
      return dateObj.toISOString().split('T')[0];
    }
    if (scheduleData?.date) {
      const parsed = new Date(scheduleData.date);
      if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  // -------------------------------------------------------------------
  // Load Logic
  // Priority:
  // 1. Existing minute record (fileId !== 'new') → load saved data
  // 2. Coming from Dashboard (location.state.returnToDashboard exists
  //    AND hearingNumber present) → pre-fill from Dashboard state
  // 3. Coming from ViewSched/ActivityLog (location.state.initialData) → pre-populate
  // 4. Fallback → blank form
  // -------------------------------------------------------------------
  useEffect(() => {
    const allFiles    = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
    const allHearings = JSON.parse(localStorage.getItem('hearings')) || [];

    // --- 1. Existing record ---
    if (fileId !== 'new') {
      const currentFile = allFiles.find(f => String(f.id) === String(fileId));
      if (currentFile) {
        setCaseData({ docketNo: currentFile.docketNo || "", matter: currentFile.matter || "" });

        if (currentFile.conferences && currentFile.conferences.length > 0) {
          const firstConf  = currentFile.conferences[0];
          const hasParties =
            firstConf.requestingParties?.some(p => p && p.trim() !== "") ||
            firstConf.respondingParties?.some(p => p && p.trim() !== "");

          if (!hasParties && currentFile.linkedScheduleId) {
            const linkedHearing = allHearings.find(
              h => String(h.id) === String(currentFile.linkedScheduleId)
            );
            if (linkedHearing) {
              const updatedConferences = currentFile.conferences.map((conf, idx) =>
                idx === 0 ? {
                  ...conf,
                  requestingParties: formatParties(linkedHearing.requestingParty),
                  respondingParties: formatParties(linkedHearing.respondingParty),
                  date: conf.date || buildDateFromSchedule(linkedHearing),
                  time: conf.time || formatTo24Hour(linkedHearing.time?.split(' to ')[0] || "")
                } : conf
              );
              setConferences(updatedConferences);
            } else {
              setConferences(currentFile.conferences);
            }
          } else {
            setConferences(currentFile.conferences);
          }
        }
        return;
      }
    }

    // --- 2. FIX: Coming from Dashboard → pre-fill from hearing number + party/claims ---
    if (location.state?.returnToDashboard && location.state?.hearingNumber) {
      const { hearingNumber, party, respondingParty, claims, time } = location.state;
      setCaseData({
        docketNo: "",
        matter:   claims || ""
      });
      setConferences([{
        date:               new Date().toISOString().split('T')[0],
        time:               formatTo24Hour(time?.split(' - ')[0]?.trim() || ""),
        requestingParties:  formatParties(party),
        respondingParties:  formatParties(respondingParty),
        concerns:           "",
        status:             "Pending",
        paymentType:        "",
        amountPaid:         "0",
        totalAmount:        ""
      }]);
      return;
    }

    // --- 3. Coming from ViewSched / ActivityLog ---
    if (location.state?.initialData) {
      const passedData = location.state.initialData;
      const rawTime    = passedData.time?.split(' to ')[0]?.trim() || passedData.time || "";
      setCaseData({ docketNo: "", matter: passedData.title || "" });
      setConferences([{
        date:              buildDateFromSchedule(passedData),
        time:              formatTo24Hour(rawTime),
        requestingParties: formatParties(passedData.requestingParty),
        respondingParties: formatParties(passedData.respondingParty),
        concerns:          "",
        status:            "Pending",
        paymentType:       "",
        amountPaid:        "0",
        totalAmount:       ""
      }]);
    }
    // else: blank form (default state)
  }, [fileId]);

  const currentConf            = conferences[currentStep - 1] || {};
  const originalTotal          = parseFloat(conferences[0]?.totalAmount) || 0;
  const paidInPreviousSessions = conferences.reduce((acc, conf, index) =>
    index < currentStep - 1 ? acc + (parseFloat(conf.amountPaid) || 0) : acc, 0);
  const balanceBroughtForward  = originalTotal - paidInPreviousSessions;
  const currentSessionPaid     = parseFloat(currentConf?.amountPaid) || 0;
  const remainingBalance       = balanceBroughtForward - currentSessionPaid;
  const isFullyPaid            = originalTotal > 0 &&
    (originalTotal - conferences.reduce((a, c) => a + (parseFloat(c.amountPaid) || 0), 0)) <= 0;

  // -------------------------------------------------------------------
  // Back Navigation
  // Priority:
  // 1. returnToDashboard → go to '/' with returnToDashboard + modalData
  //                        Dashboard useEffect re-opens the modal
  // 2. returnToArchives  → /schedule with openLogInArchives flag
  // 3. returnToActivityLog → /schedule with openLog flag
  // 4. returnToMinutes   → /minutes
  // 5. Came from ViewSched → returnToSchedule
  // 6. Fallback          → /minutes
  // -------------------------------------------------------------------
  const handleBackNavigation = () => {
    if (location.state?.returnToDashboard) {
      navigate('/', {
        state: {
          returnToDashboard: true,
          modalData: location.state.modalData  // restore the exact modal state
        }
      });
      return;
    }
    if (location.state?.returnToArchives) {
      navigate('/schedule', { state: { openLogInArchives: true } });
      return;
    }
    if (location.state?.returnToActivityLog) {
      navigate('/schedule', { state: { openLog: true } });
      return;
    }
    if (location.state?.returnToMinutes) {
      navigate('/minutes');
      return;
    }
    const scheduleData = location.state?.initialData;
    const scheduleId   = location.state?.scheduleId;
    if (scheduleData || scheduleId) {
      let scheduleToReturn = scheduleData;
      if (!scheduleToReturn && scheduleId) {
        const allSchedules = JSON.parse(localStorage.getItem('hearings')) || [];
        scheduleToReturn   = allSchedules.find(s => String(s.id) === String(scheduleId));
      }
      if (scheduleToReturn) {
        navigate('/schedule', { state: { returnToSchedule: scheduleToReturn } });
        return;
      }
    }
    navigate('/minutes');
  };

  // -------------------------------------------------------------------
  // Save Logic
  // -------------------------------------------------------------------
  const handleSave = () => {
    const allMinutes          = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
    const returnToDashboard   = location.state?.returnToDashboard;
    const returnToArchives    = location.state?.returnToArchives;
    const returnToActivityLog = location.state?.returnToActivityLog;
    const returnToMinutes     = location.state?.returnToMinutes;

    let actualId         = fileId;
    let linkedScheduleId = null;
    let scheduleToReturn = null;

    if (String(fileId) === 'new') {
      actualId = allMinutes.length > 0
        ? Math.max(...allMinutes.map(d => parseInt(String(d.id).replace(/\D/g, '')) || 0)) + 1
        : Date.now();
      if (location.state?.scheduleId) linkedScheduleId = location.state.scheduleId;
    } else {
      const existingFile = allMinutes.find(f => String(f.id) === String(fileId));
      if (existingFile?.linkedScheduleId) linkedScheduleId = existingFile.linkedScheduleId;
    }

    if (linkedScheduleId) {
      const allSchedules = JSON.parse(localStorage.getItem('hearings')) || [];
      scheduleToReturn   = allSchedules.find(s => String(s.id) === String(linkedScheduleId));
    } else if (location.state?.initialData) {
      scheduleToReturn = location.state.initialData;
    }

    let officerName = location.state?.initialData?.officer || "N/A";
    if ((!officerName || officerName === "N/A") && linkedScheduleId) {
      const allSchedules = JSON.parse(localStorage.getItem('hearings')) || [];
      const linked       = allSchedules.find(s => String(s.id) === String(linkedScheduleId));
      if (linked?.officer) officerName = linked.officer;
    }

    const newEntry = {
      id: actualId,
      docketNo:     caseData.docketNo,
      matter:       caseData.matter,
      hearingTitle: caseData.matter,
      officer:      officerName,
      timestamp:    new Date().toISOString(),
      status:       currentConf.status || "Pending",
      conferences,
      selected:         false,
      linkedScheduleId
    };

    const index          = allMinutes.findIndex(m => String(m.id) === String(actualId));
    const updatedMinutes = index !== -1
      ? allMinutes.map((m, i) => i === index ? newEntry : m)
      : [newEntry, ...allMinutes];

    localStorage.setItem('allMinutesFiles', JSON.stringify(updatedMinutes));

    toast.success("Minutes saved successfully!", {
      autoClose: 1500,
      onClose: () => {
        if (returnToDashboard) {
          // FIX: After saving, go back to Dashboard and re-open the modal
          navigate('/', {
            state: {
              returnToDashboard: true,
              modalData: location.state.modalData
            }
          });
        } else if (returnToArchives) {
          navigate('/schedule', { state: { openLogInArchives: true } });
        } else if (returnToActivityLog) {
          navigate('/schedule', { state: { openLog: true } });
        } else if (returnToMinutes) {
          navigate('/minutes');
        } else if (scheduleToReturn) {
          navigate('/schedule', { state: { returnToSchedule: scheduleToReturn } });
        } else {
          navigate('/minutes');
        }
      }
    });
  };

  // -------------------------------------------------------------------
  // Field / Party Handlers
  // -------------------------------------------------------------------
  const updateConfField = (field, value) => {
    setConferences(prev => {
      const updated = [...prev];
      updated[currentStep - 1] = { ...updated[currentStep - 1], [field]: value };
      if (field === 'totalAmount' && currentStep === 1) {
        for (let i = 1; i < updated.length; i++) updated[i].totalAmount = value;
      }
      return updated;
    });
    if (paymentError) setPaymentError("");
  };

  const updateParty = (type, index, val) => {
    setConferences(prev => {
      const updated    = [...prev];
      const targetConf = { ...updated[currentStep - 1] };
      const list       = [...targetConf[type]];
      list[index]      = val;
      targetConf[type] = list;
      updated[currentStep - 1] = targetConf;
      return updated;
    });
  };

  const addPartyRow = (type) => {
    setConferences(prev => {
      const updated    = [...prev];
      const targetConf = { ...updated[currentStep - 1] };
      targetConf[type] = [...targetConf[type], ""];
      updated[currentStep - 1] = targetConf;
      return updated;
    });
  };

  const deletePartyRow = (type, index) => {
    setConferences(prev => {
      const updated    = [...prev];
      const targetConf = { ...updated[currentStep - 1] };
      const list       = [...targetConf[type]];
      if (list.length > 1) list.splice(index, 1);
      else list[0] = "";
      targetConf[type] = list;
      updated[currentStep - 1] = targetConf;
      return updated;
    });
  };

  const handlePaymentTypeChange = (type) => {
    const newVal = currentConf.paymentType === type ? "" : type;
    updateConfField('paymentType', newVal);
    if (newVal === 'Full Payment' && currentConf.totalAmount) {
      updateConfField('amountPaid', balanceBroughtForward.toString());
    }
  };

  const handleSavePaymentTerms = () => {
    const paid = parseFloat(currentConf.amountPaid) || 0;
    if (!currentConf.paymentType) return setPaymentError("Select a payment type.");
    if (parseFloat(currentConf.totalAmount) <= 0) return setPaymentError("Please enter a valid total amount.");
    if (paid > balanceBroughtForward) return setPaymentError(`Payment exceeds current balance (₱${balanceBroughtForward}).`);
    setPaymentError("");
    setIsPaymentModalOpen(false);
    toast.success("Payment terms updated!");
  };

  const handleDeleteSession = () => {
    if (conferences.length <= 1) { toast.error("Cannot delete the only remaining session."); return; }
    setConferences(conferences.filter((_, i) => i !== currentStep - 1));
    setCurrentStep(1);
    toast.info("Session removed");
  };

  const handlePreviewPDF = () => {
    const element      = document.getElementById('pdf-content');
    setIsGeneratingPdf(true);
    const safeDocketNo = caseData.docketNo
      ? caseData.docketNo.replace(/[/\\?%*:|"<>]/g, '-')
      : 'Draft';
    const opt = {
      margin:     [10, 10, 10, 10],
      filename:   `Minutes_${safeDocketNo}_S${currentStep}.pdf`,
      image:      { type: 'jpeg', quality: 0.98 },
      html2canvas:{ scale: 2, useCORS: true, scrollY: 0 },
      jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    setTimeout(() => {
      html2pdf().set(opt).from(element).outputPdf('blob').then((blob) => {
        setPdfUrl(URL.createObjectURL(blob));
        setIsPreviewOpen(true);
        setIsGeneratingPdf(false);
      }).catch((error) => {
        console.error("PDF Generation Error:", error);
        toast.error("Failed to generate PDF");
        setIsGeneratingPdf(false);
      });
    }, 800);
  };

  const pdfInputStyle = isGeneratingPdf
    ? { border: 'none', background: 'none', padding: 0, height: 'auto', outline: 'none' }
    : {};

  return (
    <div className={`min-info-container ${isGeneratingPdf ? 'pdf-mode' : ''}`}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={() => {
          const lastConf = conferences[conferences.length - 1];
          setConferences([...conferences, {
            date: "", time: "",
            requestingParties: [...lastConf.requestingParties],
            respondingParties: [...lastConf.respondingParties],
            concerns:     "",
            status:       lastConf.status,
            paymentType:  lastConf.paymentType,
            amountPaid:   "0",
            totalAmount:  lastConf.totalAmount
          }]);
          setCurrentStep(conferences.length + 1);
          setIsModalOpen(false);
          toast.success("New session added!");
        }}
        onCancel={() => setIsModalOpen(false)}
      />

      {isPaymentModalOpen && (
        <div className="preview-modal-overlay">
          <div className="payment-modal-content" style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '450px', position: 'relative' }}>
            <button className="btn-close-preview" onClick={() => setIsPaymentModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
              <FaTimes />
            </button>
            <h2 style={{ textAlign: 'center', color: '#1a237e', marginBottom: '20px' }}>Payment Terms</h2>
            {paymentError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', borderLeft: '4px solid #ef4444' }}>
                <FaExclamationCircle size={14} /> {paymentError}
              </div>
            )}
            <div className="payment-options" style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handlePaymentTypeChange('Full Payment')}>
                {currentConf.paymentType === 'Full Payment' ? <FaCheckSquare color="#4caf50" size={20}/> : <FaSquare color="#ccc" size={20}/>}
                <span style={{ fontWeight: '600' }}>Full Payment</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => handlePaymentTypeChange('Partial Payment')}>
                {currentConf.paymentType === 'Partial Payment' ? <FaCheckSquare color="#4caf50" size={20}/> : <FaSquare color="#ccc" size={20}/>}
                <span style={{ fontWeight: '600' }}>Partial Payment</span>
              </div>
            </div>
            <div className="balance-due-section" style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div className="partial-pay-ui">
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>TOTAL AGREED AMOUNT:</label>
                  {currentStep === 1 ? (
                    <div style={{ position: 'relative', marginTop: '4px' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>₱</span>
                      <input type="number" value={currentConf.totalAmount} onChange={(e) => updateConfField('totalAmount', e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 25px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                  ) : (
                    <p style={{ margin: '4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#030a49' }}>₱ {originalTotal.toLocaleString()}</p>
                  )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>SESSION PAYMENT:</label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>₱</span>
                    <input type="number" value={currentConf.amountPaid} onChange={(e) => updateConfField('amountPaid', e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 25px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '10px', textAlign: 'right' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>REMAINING BALANCE:</label>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: remainingBalance <= 0 ? '#10b981' : '#ef4444' }}>
                    ₱ {remainingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <button className="add-name-btn" style={{ background: '#030a49', marginTop: '20px', width: '100%' }} onClick={handleSavePaymentTerms}>Update Terms</button>
          </div>
        </div>
      )}

      <div className={`form-card ${isGeneratingPdf ? 'is-generating-pdf' : ''}`} id="pdf-content">
        <div className="pdf-only-header">
          <img src="/assets/logo.svg" alt="DOLE Logo" style={{ width: '80px', height: 'auto', display: 'block', margin: '0 auto 10px' }} />
          <p style={{ margin: '2px 0', fontWeight: 'bold', textAlign: 'center' }}>REPUBLIC OF THE PHILIPPINES</p>
          <p style={{ margin: '2px 0', textAlign: 'center' }}>Department of Labor and Employment</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold', textAlign: 'center' }}>DOLE REGIONAL OFFICE NO. X</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold', textAlign: 'center' }}>CAGAYAN DE ORO – FIELD OFFICE</p>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '2px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>SINGLE ENTRY APPROACH (SENA) PROGRAM</p>
            <p style={{ margin: '2px 0', fontSize: '0.85rem', fontStyle: 'italic' }}>(Per Department Order No. 249, Series of 2025)</p>
          </div>
          <hr style={{ border: '1px solid #000', margin: '10px 0' }} />
        </div>

        <div className="form-header">
          <div className="header-left">
            {!isGeneratingPdf && (
              <button className="back-arrow" onClick={handleBackNavigation}>
                <FaArrowLeft />
              </button>
            )}
            <h2 className="title-text">DOLE - SENA (Minutes)</h2>
            {!isGeneratingPdf && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-new-conf" onClick={() => setIsModalOpen(true)} disabled={isFullyPaid}
                  style={{ opacity: isFullyPaid ? 0.5 : 1, cursor: isFullyPaid ? 'not-allowed' : 'pointer' }}>
                  <FaPlus /> New Session
                </button>
                <button className="btn-delete-row" style={{ background: '#fee2e2', color: '#b91c1c' }} onClick={handleDeleteSession}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          {!isGeneratingPdf && (
            <div className="pagination-container">
              <span className="nav-arrow" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}>‹</span>
              {conferences.map((_, i) => (
                <span key={i} className={`page-num ${currentStep === i + 1 ? 'active' : ''}`} onClick={() => setCurrentStep(i + 1)}>
                  {i + 1}
                </span>
              ))}
              <span className="nav-arrow" onClick={() => setCurrentStep(prev => Math.min(conferences.length, prev + 1))}>›</span>
            </div>
          )}
        </div>

        <div className="top-fields">
          <div className="field-group">
            <label>DOCKET NO:</label>
            <input type="text" value={caseData.docketNo} onChange={(e) => setCaseData({ ...caseData, docketNo: e.target.value })} style={pdfInputStyle} placeholder="e.g., SENA-2024-001" />
          </div>
          <div className="field-group">
            <label>DATE:</label>
            <input type={isGeneratingPdf ? "text" : "date"} value={currentConf?.date} onChange={(e) => updateConfField('date', e.target.value)} style={pdfInputStyle} />
          </div>
          <div className="field-group">
            <label>TIME:</label>
            <input type={isGeneratingPdf ? "text" : "time"} value={currentConf?.time} onChange={(e) => updateConfField('time', e.target.value)} style={pdfInputStyle} />
          </div>
        </div>

        <div className="full-field">
          <label>IN THE MATTER OF REQUEST FOR ASSISTANCE BETWEEN:</label>
          <input type="text" value={caseData.matter} onChange={(e) => setCaseData({ ...caseData, matter: e.target.value })} style={pdfInputStyle} placeholder="Enter case matter" />
        </div>

        <div className="appearance-section">
          <h3>APPEARANCE</h3>
          <div className="party-columns">
            <div className="column">
              <h4>REQUESTING PARTY</h4>
              {currentConf?.requestingParties?.map((name, i) => (
                <div key={i} className="input-row">
                  <span className="row-num">{i + 1}.</span>
                  <input type="text" value={name} onChange={(e) => updateParty('requestingParties', i, e.target.value)} style={pdfInputStyle} placeholder="Full name" />
                  {!isGeneratingPdf && <button className="btn-delete-row" onClick={() => deletePartyRow('requestingParties', i)}><FaTrash size={12} /></button>}
                </div>
              ))}
              {!isGeneratingPdf && <button className="add-name-btn" onClick={() => addPartyRow('requestingParties')}><FaPlus /> Add Name</button>}
            </div>
            <div className="column">
              <h4>RESPONDING PARTY</h4>
              {currentConf?.respondingParties?.map((name, i) => (
                <div key={i} className="input-row">
                  <span className="row-num">{i + 1}.</span>
                  <input type="text" value={name} onChange={(e) => updateParty('respondingParties', i, e.target.value)} style={pdfInputStyle} placeholder="Full name" />
                  {!isGeneratingPdf && <button className="btn-delete-row" onClick={() => deletePartyRow('respondingParties', i)}><FaTrash size={12} /></button>}
                </div>
              ))}
              {!isGeneratingPdf && <button className="add-name-btn" onClick={() => addPartyRow('respondingParties')}><FaPlus /> Add Name</button>}
            </div>
          </div>
        </div>

        <div className="minutes-section">
          <div className="section-title-row">
            <h3>MINUTES OF CONFERENCE (SESSION {currentStep})</h3>
            {!isGeneratingPdf && <button className="btn-payment" onClick={() => setIsPaymentModalOpen(true)}>Payment Terms</button>}
          </div>
          {!isGeneratingPdf ? (
            <textarea placeholder="Issues and Concerns..." value={currentConf?.concerns} onChange={(e) => updateConfField('concerns', e.target.value)} rows="6" />
          ) : (
            <div className="pdf-dynamic-text">{currentConf?.concerns || "No concerns recorded."}</div>
          )}

          {!isGeneratingPdf && (
            <div className="form-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div className="status-payment-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="status-select-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Status:</label>
                  <select value={currentConf?.status} onChange={(e) => updateConfField('status', e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="">Select</option>
                    <option value="Settled">Settled</option>
                    <option value="Partial">Settled (Partial)</option>
                    <option value="Lack of Interest">Lack of Interest</option>
                    <option value="Approval for Endorsement">Approval for Endorsement</option>
                  </select>
                </div>
                {originalTotal > 0 && (
                  <div className="payment-label" style={{ background: '#f1f5f9', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', width: 'fit-content' }}>
                    <span style={{ color: '#475569', fontWeight: 'bold' }}>Agreed: ₱{originalTotal.toLocaleString()}</span>
                    <span style={{ margin: '0 12px', color: '#cbd5e1' }}>|</span>
                    {isFullyPaid
                      ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>Fully Paid</span>
                      : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Bal: ₱{remainingBalance.toLocaleString()}</span>
                    }
                  </div>
                )}
              </div>
              <div className="button-group" style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-preview" onClick={handlePreviewPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <FaDownload /> Preview & Download
                </button>
                <button className="btn-submit" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <FaSave /> SAVE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>Document Preview (Session {currentStep})</h3>
              <button className="btn-close-preview" onClick={() => { setIsPreviewOpen(false); if (pdfUrl) URL.revokeObjectURL(pdfUrl); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                <FaTimes />
              </button>
            </div>
            <iframe src={pdfUrl} title="PDF Preview" className="preview-iframe" style={{ width: '100%', height: '80vh', border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MinutesInfo;