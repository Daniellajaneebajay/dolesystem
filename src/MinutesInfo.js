import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaTimes } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import "./MinutesInfo.css";

const MinutesInfo = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [caseData, setCaseData] = useState({ docketNo: "", matter: "" });
  const [conferences, setConferences] = useState([
    {
      date: "",
      time: "",
      requestingParties: [""],
      respondingParties: [""],
      concerns: "",
      status: "",
      amountPaid: "0",
      totalAmount: ""
    }
  ]);

  useEffect(() => {
    const allFiles = JSON.parse(localStorage.getItem('allMinutesFiles')) || [];
    const currentFile = allFiles.find(f => String(f.id) === String(fileId));

    if (currentFile) {
      setCaseData({
        docketNo: currentFile.docketNo || "",
        matter: currentFile.matter || ""
      });

      if (currentFile.conferences?.length > 0) {
        setConferences(currentFile.conferences);
      }
    }
  }, [fileId]);

  const currentConf = conferences[currentStep - 1];
  const originalTotal = parseFloat(conferences[0]?.totalAmount) || 0;

  const paidInPreviousSessions = conferences.reduce((acc, conf, index) => {
    if (index < currentStep - 1) return acc + (parseFloat(conf.amountPaid) || 0);
    return acc;
  }, 0);

  const balanceBroughtForward = originalTotal - paidInPreviousSessions;
  const currentSessionPaid = parseFloat(currentConf?.amountPaid) || 0;
  const remainingBalance = balanceBroughtForward - currentSessionPaid;

  const handlePreviewPDF = () => {
    const element = document.getElementById('pdf-content');
    setIsGeneratingPdf(true);

    const safeDocketNo = caseData.docketNo
      ? caseData.docketNo.replace(/[/\\?%*:|"<>]/g, '-')
      : 'Draft';

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Minutes_${safeDocketNo}_S${currentStep}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
      html2pdf().set(opt).from(element).outputPdf('blob').then((blob) => {
        setPdfUrl(URL.createObjectURL(blob));
        setIsPreviewOpen(true);
        setIsGeneratingPdf(false);
      });
    }, 800);
  };

  const pdfInputStyle = isGeneratingPdf
    ? { border: 'none', background: 'none', padding: 0 }
    : {};

  return (
    <div className={`min-info-container ${isGeneratingPdf ? 'pdf-mode' : ''}`}>

      <div className={`form-card ${isGeneratingPdf ? 'is-generating-pdf' : ''}`} id="pdf-content">

        <div className="form-header">
          <div className="header-left">
            <button className="back-arrow" onClick={() => navigate('/minutes')}>
              <FaArrowLeft />
            </button>
            <h2>DOLE - SENA (Minutes)</h2>
          </div>

          <div className="pagination-container">
            <span className="nav-arrow" onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}>‹</span>
            {conferences.map((_, i) => (
              <span
                key={i}
                className={`page-num ${currentStep === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentStep(i + 1)}
              >
                {i + 1}
              </span>
            ))}
            <span className="nav-arrow" onClick={() => setCurrentStep(prev => Math.min(conferences.length, prev + 1))}>›</span>
          </div>
        </div>

        <div className="top-fields">
          <div className="field-group">
            <label>DOCKET NO:</label>
            <input type="text" value={caseData.docketNo} readOnly style={pdfInputStyle}/>
          </div>
          <div className="field-group">
            <label>DATE:</label>
            <input type="text" value={currentConf?.date} readOnly style={pdfInputStyle}/>
          </div>
          <div className="field-group">
            <label>TIME:</label>
            <input type="text" value={currentConf?.time} readOnly style={pdfInputStyle}/>
          </div>
        </div>

        <div className="full-field">
          <label>IN THE MATTER OF REQUEST FOR ASSISTANCE BETWEEN:</label>
          <input type="text" value={caseData.matter} readOnly style={pdfInputStyle}/>
        </div>

        <div className="appearance-section">
          <h3>APPEARANCE</h3>
          <div className="party-columns">

            <div className="column">
              <h4>REQUESTING PARTY</h4>
              {currentConf?.requestingParties.map((name, i) => (
                <div key={i} className="input-row">
                  <span className="row-num">{i + 1}.</span>
                  <input type="text" value={name} readOnly style={pdfInputStyle}/>
                </div>
              ))}
            </div>

            <div className="column">
              <h4>RESPONDING PARTY</h4>
              {currentConf?.respondingParties.map((name, i) => (
                <div key={i} className="input-row">
                  <span className="row-num">{i + 1}.</span>
                  <input type="text" value={name} readOnly style={pdfInputStyle}/>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="minutes-section">
          <div className="section-title-row">
            <h3>MINUTES OF CONFERENCE (SESSION {currentStep})</h3>
          </div>

          <textarea value={currentConf?.concerns} readOnly />

          <div style={{ marginTop: '20px' }}>
            <strong>Status:</strong> {currentConf?.status || "N/A"}
          </div>

          {originalTotal > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Total:</strong> ₱{originalTotal.toLocaleString()} <br />
              <strong>Balance:</strong> ₱{remainingBalance.toLocaleString()}
            </div>
          )}

          <div className="button-group" style={{ marginTop: '20px' }}>
            <button className="btn-preview" onClick={handlePreviewPDF}>
              <FaDownload /> Preview & Download
            </button>
          </div>
        </div>

      </div>

      {isPreviewOpen && (
        <div className="preview-modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-header">
              <h3>Document Preview</h3>
              <button className="btn-close-preview" onClick={() => setIsPreviewOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <iframe src={pdfUrl} title="PDF Preview" className="preview-iframe" />
          </div>
        </div>
      )}

    </div>
  );
};

export default MinutesInfo;
