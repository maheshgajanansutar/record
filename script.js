// Global variables
let landRecords = [];
let currentPage = 1;
const recordsPerPage = 10;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadLandRecords();
    
    // Set up form submission
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Set up reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        document.getElementById('searchForm').reset();
        document.getElementById('resultsSection').style.display = 'none';
    });
    
    // Set up download button
    document.getElementById('downloadBtn').addEventListener('click', function() {
        downloadResults();
    });
    
    // Set up print button
    document.getElementById('printBtn').addEventListener('click', function() {
        printResults();
    });
    
    // Set up PDF popup close button
    document.getElementById('pdfPopupClose').addEventListener('click', function() {
        closePdfPopup();
    });
    
    // Close PDF popup when clicking outside
    document.getElementById('pdfPopup').addEventListener('click', function(e) {
        if (e.target === this) {
            closePdfPopup();
        }
    });
    
    // Set up taluka-village dependency
    document.getElementById('taluka').addEventListener('change', function() {
        updateVillages();
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Close PDF popup on Escape key
        if (e.key === 'Escape') {
            closePdfPopup();
        }
        
        // Submit form on Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        }
    });
    
    // Add input validation
    document.getElementById('holderName').addEventListener('input', function(e) {
        // Allow only letters, spaces, and Marathi characters
        this.value = this.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
    });
    
    document.getElementById('surveyNo').addEventListener('input', function(e) {
        // Allow only alphanumeric characters and common survey number symbols
        this.value = this.value.replace(/[^a-zA-Z0-9\u0900-\u097F\/\-\.\s]/g, '');
    });
});

// Load land records from JSON file
async function loadLandRecords() {
    showLoading();
    
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('डेटा लोड करताना त्रुटी आली');
        }
        
        const data = await response.json();
        landRecords = data.landRecords;
        
        // Populate dropdowns
        populateDropdowns();
        
        // Update statistics
        updateStatistics();
        
        hideLoading();
        showSuccess('डेटा यशस्वीरित्या लोड झाला');
    } catch (error) {
        hideLoading();
        showError('डेटा लोड करण्यात अयशस्वी: ' + error.message);
        console.error('Error loading data:', error);
    }
}

// Update statistics in header
function updateStatistics() {
    document.getElementById('totalRecords').textContent = landRecords.length;
    
    const talukas = [...new Set(landRecords.map(record => record.taluka))];
    document.getElementById('totalTalukas').textContent = talukas.length;
    
    const villages = [...new Set(landRecords.map(record => record.village))];
    document.getElementById('totalVillages').textContent = villages.length;
    
    const years = landRecords.map(record => record.year);
    const startYear = Math.min(...years);
    document.getElementById('startYear').textContent = startYear;
}

// Populate dropdowns with unique values
function populateDropdowns() {
    const talukaSelect = document.getElementById('taluka');
    const villageSelect = document.getElementById('village');
    const yearSelect = document.getElementById('year');
    
    // Get unique values
    const talukas = [...new Set(landRecords.map(record => record.taluka))];
    const villages = [...new Set(landRecords.map(record => record.village))];
    const years = [...new Set(landRecords.map(record => record.year))].sort((a, b) => b - a);
    
    // Populate talukas
    talukas.forEach(taluka => {
        const option = document.createElement('option');
        option.value = taluka;
        option.textContent = taluka;
        talukaSelect.appendChild(option);
    });
    
    // Populate villages
    villages.forEach(village => {
        const option = document.createElement('option');
        option.value = village;
        option.textContent = village;
        villageSelect.appendChild(option);
    });
    
    // Populate years
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Update villages based on selected taluka
function updateVillages() {
    const talukaSelect = document.getElementById('taluka');
    const villageSelect = document.getElementById('village');
    const selectedTaluka = talukaSelect.value;
    
    // Clear current options except the first one
    while (villageSelect.options.length > 1) {
        villageSelect.remove(1);
    }
    
    // If a taluka is selected, filter villages
    if (selectedTaluka) {
        const villages = [...new Set(
            landRecords
                .filter(record => record.taluka === selectedTaluka)
                .map(record => record.village)
        )];
        
        villages.forEach(village => {
            const option = document.createElement('option');
            option.value = village;
            option.textContent = village;
            villageSelect.appendChild(option);
        });
    } else {
        // If no taluka selected, show all villages
        const allVillages = [...new Set(landRecords.map(record => record.village))];
        allVillages.forEach(village => {
            const option = document.createElement('option');
            option.value = village;
            option.textContent = village;
            villageSelect.appendChild(option);
        });
    }
}

// Perform search based on form inputs
function performSearch() {
    showLoading();
    
    // Simulate API delay
    setTimeout(() => {
        try {
            const taluka = document.getElementById('taluka').value;
            const village = document.getElementById('village').value;
            const holderName = document.getElementById('holderName').value.toLowerCase();
            const surveyNo = document.getElementById('surveyNo').value.toLowerCase();
            const year = document.getElementById('year').value;
            const type = document.getElementById('type').value;
            
            // Filter records based on search criteria
            const filteredRecords = landRecords.filter(record => {
                return (!taluka || record.taluka === taluka) &&
                       (!village || record.village === village) &&
                       (!holderName || record.holderName.toLowerCase().includes(holderName)) &&
                       (!surveyNo || record.surveyNo.toLowerCase().includes(surveyNo)) &&
                       (!year || record.year == year) &&
                       (!type || record.type === type);
            });
            
            // Display results
            displayResults(filteredRecords);
            hideLoading();
            
            if (filteredRecords.length > 0) {
                showSuccess(`${filteredRecords.length} नोंदी सापडल्या`);
            }
        } catch (error) {
            hideLoading();
            showError('शोध प्रक्रिया अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.');
            console.error('Search error:', error);
        }
    }, 1000); // Simulate 1 second delay
}

// Display search results in the table
function displayResults(records) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsBody = document.getElementById('resultsBody');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    const pagination = document.getElementById('pagination');
    
    // Show results section
    resultsSection.style.display = 'block';
    
    // Clear current results
    resultsBody.innerHTML = '';
    
    // Update results count
    resultsCount.textContent = `${records.length} नोंदी सापडल्या`;
    
    // Show/hide no results message
    if (records.length === 0) {
        noResults.style.display = 'block';
        pagination.style.display = 'none';
    } else {
        noResults.style.display = 'none';
        
        // Calculate pagination
        const totalPages = Math.ceil(records.length / recordsPerPage);
        currentPage = 1;
        
        // Display pagination if needed
        if (records.length > recordsPerPage) {
            displayPagination(totalPages, records);
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
        
        // Display first page
        displayPage(records, 1);
    }
}

// Display a specific page of results
function displayPage(records, page) {
    const resultsBody = document.getElementById('resultsBody');
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, records.length);
    const pageRecords = records.slice(startIndex, endIndex);
    
    // Clear current results
    resultsBody.innerHTML = '';
    
    // Add records to table
    pageRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${record.taluka}</td>
            <td>${record.village}</td>
            <td>${record.holderName}</td>
            <td>${record.year}</td>
            <td>${record.surveyNo}</td>
            <td>${record.type}</td>
            <td>
                <a class="download-link" data-pdf-link="${record.downloadLink}" data-record-name="${record.holderName} - ${record.surveyNo}">
                    <i class="fas fa-file-pdf"></i> डाउनलोड
                </a>
            </td>
        `;
        
        resultsBody.appendChild(row);
    });
    
    // Add event listeners to download links
    document.querySelectorAll('.download-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pdfLink = this.getAttribute('data-pdf-link');
            const recordName = this.getAttribute('data-record-name');
            openPdfPopup(pdfLink, recordName);
        });
    });
}

// Display pagination controls
function displayPagination(totalPages, records) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(records, currentPage);
            displayPagination(totalPages, records);
        }
    });
    pagination.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayPage(records, currentPage);
            displayPagination(totalPages, records);
        });
        pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(records, currentPage);
            displayPagination(totalPages, records);
        }
    });
    pagination.appendChild(nextButton);
}

// Open PDF in popup
function openPdfPopup(pdfLink, recordName) {
    const pdfPopup = document.getElementById('pdfPopup');
    const pdfPopupIframe = document.getElementById('pdfPopupIframe');
    const pdfPopupTitle = document.getElementById('pdfPopupTitle');
    
    // Set PDF title
    pdfPopupTitle.textContent = recordName;
    
    // Set PDF source
    pdfPopupIframe.src = pdfLink;
    
    // Show popup
    pdfPopup.style.display = 'flex';
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close PDF popup
function closePdfPopup() {
    const pdfPopup = document.getElementById('pdfPopup');
    const pdfPopupIframe = document.getElementById('pdfPopupIframe');
    
    // Hide popup
    pdfPopup.style.display = 'none';
    
    // Clear iframe source
    pdfPopupIframe.src = '';
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// Download all search results as a CSV file
function downloadResults() {
    const taluka = document.getElementById('taluka').value;
    const village = document.getElementById('village').value;
    const holderName = document.getElementById('holderName').value.toLowerCase();
    const surveyNo = document.getElementById('surveyNo').value.toLowerCase();
    const year = document.getElementById('year').value;
    const type = document.getElementById('type').value;
    
    // Filter records based on search criteria
    const filteredRecords = landRecords.filter(record => {
        return (!taluka || record.taluka === taluka) &&
               (!village || record.village === village) &&
               (!holderName || record.holderName.toLowerCase().includes(holderName)) &&
               (!surveyNo || record.surveyNo.toLowerCase().includes(surveyNo)) &&
               (!year || record.year == year) &&
               (!type || record.type === type);
    });
    
    if (filteredRecords.length === 0) {
        showError('डाउनलोड करण्यासाठी कोणतेही परिणाम नाहीत.');
        return;
    }
    
    // Create CSV content
    let csvContent = "अ.क्र.,तालुका,गाव,रेखांकन धारकाचे नाव,रेखांकन वर्ष,सर्व्हे क्रमांक,बिनशेती प्रकार,डाउनलोड लिंक\n";
    
    filteredRecords.forEach((record, index) => {
        csvContent += `"${index + 1}","${record.taluka}","${record.village}","${record.holderName}","${record.year}","${record.surveyNo}","${record.type}","${record.downloadLink}"\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "land_records_search_results.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('CSV फाइल यशस्वीरित्या डाउनलोड झाली');
}

// Print results
function printResults() {
    const resultsSection = document.getElementById('resultsSection');
    
    if (resultsSection.style.display === 'block') {
        window.print();
    } else {
        showError('प्रिंट करण्यासाठी प्रथम शोध परिणाम पहा.');
    }
}

// Show loading indicator
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = message;
    errorElement.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    document.getElementById('successText').textContent = message;
    successElement.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}