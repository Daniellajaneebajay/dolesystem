import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaPlus } from 'react-icons/fa';
import './ViewSched.css';

const ViewSched = ({ scheduleData: propScheduleData, onBack, onEdit, onAddMinutes }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Use location state if available, otherwise use prop
    const scheduleData = location.state?.scheduleData || propScheduleData;

    const handleAddMinutes = () => {
        const allMinutes = JSON.parse(localStorage.getItem("allMinutesFiles")) || [];
        
        // FIX: Match by scheduleData.id (linkedScheduleId) first, then fall back to matter/title match
        const alreadyExists = allMinutes.find(doc => {
            // Primary match: by linked schedule ID (most reliable)
            if (scheduleData.id && doc.linkedScheduleId) {
                return String(doc.linkedScheduleId) === String(scheduleData.id);
            }
            // Fallback match: by matter or hearingTitle
            return doc.matter === scheduleData.title || doc.hearingTitle === scheduleData.title;
        });
        
        if (alreadyExists) {
            toast.warning("A minute record for this hearing already exists. Redirecting...");
            setTimeout(() => navigate(`/minutesinfo`, { 
                state: { 
                    fileId: alreadyExists.id,
                    initialData: scheduleData,
                    returnToSchedule: 'view',
                    scheduleId: scheduleData.id
                } 
            }), 1000);
            return;
        }

        // No existing record — navigate to MinutesInfo with full schedule data
        navigate('/minutesinfo', {
            state: {
                fileId: 'new',
                initialData: scheduleData,
                returnToSchedule: 'view',
                scheduleId: scheduleData.id
            }
        });
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const renderPartyList = (partyData) => {
        if (!partyData) return <p className="view-data-value">--</p>;
        
        const names = typeof partyData === 'string' 
            ? partyData.split(',').map(n => n.trim()).filter(n => n !== "")
            : Array.isArray(partyData) ? partyData : [partyData];
        
        return (
            <ol className="view-party-list-numbered">
                {names.map((name, index) => (
                    <li key={index}>
                        <span className="list-index">{index + 1}.</span>
                        <span className="list-name">{name}</span>
                    </li>
                ))}
            </ol>
        );
    };

    return (
        <div className="view-sched-page-container">
            <div className="view-header-flex">
                <div className="view-header-left">
                    <button className="back-circle-btn" onClick={handleBack}>
                        <FaArrowLeft />
                    </button>
                    <div className="view-header-titles">
                        <h1>VIEW SCHEDULE</h1>
                        <p>Monitor your case hearings and scheduled advisory sessions.</p>
                    </div>
                </div>
                <button className="view-edit-btn" onClick={onEdit}>
                    <FaEdit /> EDIT
                </button>
            </div>

            <div className="view-main-card">
                <div className="view-split-row">
                    <div className="view-col">
                        <h4 className="view-gray-bar">ACTIVITY</h4>
                        <div className="view-inner-padding view-flex-content">
                            <div className="view-data-block">
                                <label className="view-blue-label">Type</label>
                                <p className="view-data-value">{scheduleData.title || 'SEnA'}</p>
                            </div>
                            <div className="view-data-block">
                                <label className="view-blue-label">Available Hearing Officer</label>
                                <p className="view-data-value officer-name">{scheduleData.officer || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="view-col">
                        <h4 className="view-gray-bar">AVAILABILITY</h4>
                        <div className="view-inner-padding view-grid-availability">
                            <div className="view-data-block">
                                <label className="view-blue-label">Day</label>
                                <p className="view-data-value">{scheduleData.day}</p>
                            </div>
                            <div className="view-data-block">
                                <label className="view-blue-label">Month</label>
                                <p className="view-data-value">{scheduleData.monthName || scheduleData.date}</p>
                            </div>
                            <div className="view-data-block">
                                <label className="view-blue-label">Time</label>
                                <p className="view-data-value">{scheduleData.time}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="view-full-row">
                    <h4 className="view-gray-bar">CAUSE OF ACTION</h4>
                    <div className="view-inner-padding view-flex-content">
                        <div className="view-data-block">
                            <label className="view-blue-label">Claims/Issues</label>
                            <p className="view-data-value">{scheduleData.laborViolation || '--'}</p>
                        </div>
                        <div className="view-data-block text-right">
                            <label className="view-blue-label">Other</label>
                            <p className="view-data-value">{scheduleData.otherIssues || '--'}</p>
                        </div>
                    </div>
                </div>

                <div className="view-full-row">
                    <h4 className="view-gray-bar">THE PARTIES</h4>
                    <div className="view-inner-padding view-parties-grid">
                        <div className="view-party-box">
                            <label className="view-blue-label centered">Requesting Party</label>
                            {renderPartyList(scheduleData.requestingParty)}
                        </div>
                        <div className="view-party-box">
                            <label className="view-blue-label centered">Responding Party</label>
                            {renderPartyList(scheduleData.respondingParty)}
                        </div>
                    </div>
                </div>

                <div className="view-footer-actions">
                    <button className="view-add-minutes-btn" onClick={handleAddMinutes}>
                        <FaPlus /> ADD MINUTES
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSched;