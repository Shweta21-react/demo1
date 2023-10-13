import React, { useState } from "react";
import "./upload.css";
import DatePicker from "react-datepicker";
import { CheckCircle } from "bootstrap-icons/icons/check-circle.svg";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import moment from "moment";
import { Pagination } from "react-bootstrap";
import { FcApproval } from "react-icons/fc";
import { ReactComponent as BiCheckCircle } from "bootstrap-icons/icons/check-circle.svg";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const SMSForm = () => {
  const dummyTemplateData = [
    {
      title: "Template 1",
      message: "This is the first template message.",
      created: "2023-10-11",
    },
    {
      title: "Template 2",
      message: "This is the second template message.",
      created: "2023-10-12",
    },
    {
      title: "Template 5",
      message: "This is the fifth template message.",
      created: "2023-10-15",
    },
    {
      title: "Hello",
      message: "This is the third template message.",
      created: "2023-10-13",
    },
    {
      title: "Bye",
      message: "This is the fourth template message.",
      created: "2023-10-14",
    },
    {
      title: "Myself",
      message: "I am apurva the pagal",
      created: "2023-10-15",
    },
  ];
  const [option, setOption] = useState("");
  const [senderId, setSenderId] = useState("");
  const [smsType, setSMSType] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [csvData, setCSVData] = useState([]);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [messageMoney, setMessageMoney] = useState(1);
  const [errors, setErrors] = useState({});
  const [remainingCharCount, setRemainingCharCount] = useState(160);

  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [timee, setTimee] = useState(moment().format("HH:mm"));

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 5;
  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [fileData, setFileData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedColumnData, setSelectedColumnData] = useState([]);
  const [messagecolumn, setMessagecolumn] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const contents = e.target.result;
        const data = file.name.endsWith(".csv")
          ? parseCSV(contents)
          : parseXLSX(contents);
        setFileData(data);
        const columns = Object.keys(data[0]);
        setSelectedColumnData(columns);
      };

      reader.readAsText(file);
    }
  };

  const handleSelectColumnData = (event) => {
    const columnName = event.target.value;
    const columnData = fileData.map((row) => row[columnName]).join(" ");
    setMessage(columnData);
    setSelectedColumn(columnName);
  };

  const parseCSV = (csv) => {
    const results = Papa.parse(csv, { header: true }).data;
    return results;
  };

  const parseXLSX = (xlsx) => {
    const workbook = XLSX.read(xlsx, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const results = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return results.slice(1).map((row) => {
      const rowData = {};
      results[0].forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });
  };

  const clearValidationError = (field) => {
    setValidationErrors({
      ...validationErrors,
      [field]: "",
    });
  };
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setMessage(template.message);

    // Calculate character count and message money based on the selected template message
    const newCharCount = template.message.length;
    let newMessageMoney = Math.ceil((newCharCount - 160) / 100) + 1;

    if (newCharCount <= 160) {
      newMessageMoney = 1;
    } else if (newMessageMoney > 8) {
      newMessageMoney = 8;
    }

    clearValidationError("message");

    // Calculate remaining character count based on SMS count
    const remainingCharCount = Math.max(
      0,
      160 + (newMessageMoney - 1) * 100 - newCharCount
    );

    setCharCount(newCharCount);
    setMessageMoney(newMessageMoney);
    setRemainingCharCount(remainingCharCount);

    closeTemplateModal();
  };

  const openTemplateModal = () => {
    setTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setTemplateModalOpen(false);
    setSelectedTemplate(null); // Reset selected template
  };

  const openScheduleModal = () => {
    setSelectedDate(new Date());
    setTimee(moment().format("HH:mm"));
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleScheduleSubmit = () => {
    if (!selectedDate) {
      // Handle validation error - date should be selected
      return;
    }

    const selectedDateTime = moment(selectedDate)
      .hour(Number(timee.split(":")[0]))
      .minute(Number(timee.split(":")[1]));

    const currentDateTime = moment();

    const minimumTimeDifference = 60; // Minimum difference in minutes

    if (
      selectedDateTime.isBefore(
        currentDateTime.add(minimumTimeDifference, "minutes")
      )
    ) {
      // Time is less than 1 hour from the current time - handle error
      setErrors({
        ...errors,
        timePicker:
          "Please select a time more than 1 hour from the current time.",
      });
      return;
    }

    closeScheduleModal();
  };

  const handleOptionChange = (event) => {
    setOption(event.target.value);
  };

  const handleSenderIdChange = (event) => {
    setSenderId(event.target.value);
  };

  const handleSMSTypeChange = (event) => {
    setSMSType(event.target.value);
  };

  const handleSelectColumn = (event) => {
    setSelectedColumn(event.target.value);
    // Fetch and display data from the selected column
  };

  const handleMessageChange = (event) => {
    const newMessage = event.target.value.slice(0, 860);
    const newCharCount = newMessage.length;
    clearValidationError("message");
    let newMessageMoney = Math.ceil((newCharCount - 160) / 100) + 1; // Calculate SMS count

    if (newCharCount <= 160) {
      newMessageMoney = 1; // Reset to 1 if character count is 160 or less
    } else if (newMessageMoney > 8) {
      newMessageMoney = 8; // Limit to a maximum of 8 SMS
    }

    // Calculate remaining character count based on SMS count
    const remainingCharCount = Math.max(
      0,
      160 + (newMessageMoney - 1) * 100 - newCharCount
    );

    setMessage(newMessage);
    setCharCount(newCharCount);
    setMessageMoney(newMessageMoney);
    setRemainingCharCount(remainingCharCount);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validation logic for each field
    const errors = {};

    if (!option) {
      errors.option = "Option is required.";
    }

    if (!senderId) {
      errors.senderId = "Sender ID is required.";
    }

    if (!smsType) {
      errors.smsType = "SMS Type is required.";
    }

    if (!message) {
      errors.message = "Message is required.";
    }

    // Set the validation errors
    setValidationErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length === 0) {
      // Submit the form if no errors
      // Your form submission logic here
      setSuccessMessage("Message sent successfully!");
      setSuccessModalOpen(true);

      // Reset form fields
      setOption("");
      setSenderId("");
      setSMSType("");
      setMessage("");
      setCharCount(0);
      setMessageMoney(1);
      setRemainingCharCount(160);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Select an option:<span className="required">*</span>
        </label>
        <select
          value={option}
          // onChange={handleOptionChange}
          onChange={(e) => {
            setOption(e.target.value);
            clearValidationError("option");
          }}
        >
          <option value="">Select an option </option>
          <option value="trans">Trans</option>
          <option value="promo">Promo</option>
        </select>
        {validationErrors.option && (
          <p className="error-message">{validationErrors.option}</p>
        )}
      </div>

      <div>
        <label>
          Sender ID:<span className="required">*</span>
        </label>
        <select
          value={senderId}
          // onChange={handleSenderIdChange}>
          onChange={(e) => {
            setSenderId(e.target.value);
            clearValidationError("senderId");
          }}
        >
          {/* Add sender ID options here */}
          <option value="">Select SenderId </option>
          <option value="1">Mbsoft</option>
          <option value="2">630967</option>
        </select>
        {validationErrors.senderId && (
          <p className="error-message">{validationErrors.senderId}</p>
        )}
      </div>

      <div>
        <label>
          SMS Type:<span className="required">*</span>
        </label>
        <select
          value={smsType}
          // onChange={handleSMSTypeChange}>
          onChange={(e) => {
            setSMSType(e.target.value);
            clearValidationError("smsType");
          }}
        >
          <option value="">Select type</option>
          <option value="text">Text</option>
          <option value="unicode">Unicode</option>
        </select>
        {validationErrors.smsType && (
          <p className="error-message">{validationErrors.smsType}</p>
        )}
      </div>

      <div>
        <label>Upload CSV or XLSX file:</label>
        <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
      </div>

      {selectedFile && (
        <div>
          <label>Select a column from the file:</label>
          <select value={selectedColumn} onChange={handleSelectColumnData}>
            <option value="">Select a column</option>
            {selectedColumnData.map((column, index) => (
              <option key={index} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label> CSV column names:</label>
        {/* <textarea value={messagecolumn} readOnly /> */}
        <textarea value={selectedColumnData.join('\n')}  />
      </div>

      <div>
        <label>Message:</label>
        <textarea value={message} onChange={handleMessageChange} />
        {validationErrors.message && (
          <p className="error-message">{validationErrors.message}</p>
        )}
        <p>
          Character Count: {charCount} (Message Money: {messageMoney})
        </p>
        <p>Remaining Characters: {remainingCharCount}</p>
      </div>

      <div>
        <button type="button" onClick={openTemplateModal}>
          Select Template
        </button>
      </div>

      <button type="submit">Send</button>
      {/* <button type="button">Schedule</button> */}
      <div>
        <button
          type="button"
          onClick={() => {
            openScheduleModal();
            setErrors("");
          }}
        >
          Schedule
        </button>
      </div>

      {/* Render the React Bootstrap Modal when isScheduleModalOpen is true */}
      <Modal show={isScheduleModalOpen} onHide={closeScheduleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div >
        <label>Select a Date:</label><br></br>
          <DatePicker 
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            className="date-picker" 
            id="dateheight"
          />
          </div>

          <div>
            {/* <h2>Time Picker Example</h2> */}
            <label>Select a time:</label><br></br>
            <input
              type="time"
              value={timee}
              onChange={(e) => {
                const new1 = e.target.value;
                setTimee(new1);
              }}
            ></input>
           
          </div>
          
          </div>
          {errors.timePicker && <p className="error">{errors.timePicker}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeScheduleModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleScheduleSubmit}>
            Schedule
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="lg"
        show={isTemplateModalOpen}
        onHide={closeTemplateModal}
        className="custom-dialog"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Add a search bar here */}
          <input
            type="text"
            placeholder="Search Templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Create a table to display templates */}
          <table className="template-table">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Title</th>
                <th>Message</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyTemplateData
                .filter((template) =>
                  template.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .slice(
                  (currentPage - 1) * templatesPerPage,
                  currentPage * templatesPerPage
                )
                .map((template, index) => (
                  <tr key={index} className="template-row">
                    <td>{index + 1}</td>
                    <td>{template.title}</td>
                    <td className="template-message">{template.message}</td>
                    <td>{template.created}</td>
                    <td>
                      <BiCheckCircle
                        style={{ cursor: "pointer", color: "green" }}
                        onClick={() => handleSelectTemplate(template)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from(
              {
                length: Math.ceil(dummyTemplateData.length / templatesPerPage),
              },
              (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              )
            )}
            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(dummyTemplateData.length / templatesPerPage)
              }
            />
            <Pagination.Last
              onClick={() =>
                setCurrentPage(
                  Math.ceil(dummyTemplateData.length / templatesPerPage)
                )
              }
              disabled={
                currentPage ===
                Math.ceil(dummyTemplateData.length / templatesPerPage)
              }
            />
          </Pagination>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeTemplateModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal
        show={isSuccessModalOpen}
        onHide={() => setSuccessModalOpen(false)}
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <div className="success-modal-content">
            {/* <BiCheckCircle className="approval-icon" /> */}
            <p style={{ fontSize: "150%", color: "green" }}>
              Message Sent Successfully <FcApproval />
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setSuccessModalOpen(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default SMSForm;
