// Streaming services configuration
const streamingServices = {
    netflix: { name: 'Netflix', favicon: 'https://www.netflix.com/favicon.ico' },
    viaplay: { name: 'Viaplay', favicon: 'https://viaplay.se/favicon.ico' },
    disney: { name: 'Disney+', favicon: 'https://www.disneyplus.com/favicon.ico' },
    prime: { name: 'Amazon Prime', favicon: 'https://www.primevideo.com/favicon.ico' },
    max: { name: 'Max', favicon: 'https://www.hbomax.com/img/hbomax/favicon.ico' },
    apple: { name: 'Apple TV+', favicon: 'https://tv.apple.com/favicon.ico' },
    skyshowtime: { name: 'SkyShowtime', favicon: 'https://www.skyshowtime.com/favicon.ico' },
    tv4play: { name: 'TV4 Play', favicon: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/TV4sweden_logo.svg' },
    discovery: { name: 'Discovery+', favicon: 'https://i.ibb.co/yFzCZTbG/unnamed.png' }
};

// Global variables
let selectedServices = [];
let rotationPlan = [];
let servicesPerMonth = 1;
let rotationDay = 25;

// DOM elements
const serviceItems = document.querySelectorAll('.service-item');
const checkboxes = document.querySelectorAll('input[name="service"]');
const servicesPerMonthRadios = document.querySelectorAll('input[name="servicesPerMonth"]');
const rotationDaySelect = document.getElementById('rotationDay');
const previewSection = document.getElementById('previewSection');
const dateSettingsSection = document.getElementById('dateSettingsSection');
const calendarSection = document.getElementById('calendarSection');
const rotationPreview = document.getElementById('rotationPreview');
const googleCalendarBtn = document.getElementById('googleCalendarBtn');
const appleCalendarBtn = document.getElementById('appleCalendarBtn');
const outlookCalendarBtn = document.getElementById('outlookCalendarBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Event listeners
function initializeEventListeners() {
    // Service item clicks
    serviceItems.forEach(item => {
        item.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            handleServiceSelection(checkbox);
        });
    });

    // Checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleServiceSelection(this);
        });
    });

    // Services per month radio buttons
    servicesPerMonthRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            servicesPerMonth = parseInt(this.value);
            if (selectedServices.length >= 2) {
                generateRotationPlan();
                showPreview();
            }
        });
    });

    // Rotation day select
    rotationDaySelect.addEventListener('change', function() {
        rotationDay = parseInt(this.value);
        if (selectedServices.length >= 2) {
            generateRotationPlan();
            showPreview();
        }
    });

    // Calendar buttons
    googleCalendarBtn.addEventListener('click', () => generateGoogleCalendarLink());
    appleCalendarBtn.addEventListener('click', () => generateAppleCalendar());
    outlookCalendarBtn.addEventListener('click', () => generateOutlookCalendar());
}

// Handle service selection
function handleServiceSelection(checkbox) {
    const serviceId = checkbox.value;
    const item = checkbox.closest('.service-item');
    
    if (checkbox.checked) {
        if (!selectedServices.includes(serviceId)) {
            selectedServices.push(serviceId);
        }
        item.classList.add('selected');
    } else {
        selectedServices = selectedServices.filter(id => id !== serviceId);
        item.classList.remove('selected');
    }
    
    if (selectedServices.length >= 2) {
        generateRotationPlan();
        showPreview();
    } else {
        hidePreview();
    }
}


// Generate rotation plan
function generateRotationPlan() {
    rotationPlan = [];
    const currentDate = new Date();
    
    // Start from next month's selected day
    let rotationDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, rotationDay);
    
    for (let month = 0; month < 12; month++) {
        const monthServices = [];
        
        // Generate services for this month based on servicesPerMonth
        for (let i = 0; i < servicesPerMonth; i++) {
            const serviceIndex = (month * servicesPerMonth + i) % selectedServices.length;
            const serviceId = selectedServices[serviceIndex];
            const service = streamingServices[serviceId];
            monthServices.push(service);
        }
        
        rotationPlan.push({
            date: new Date(rotationDate),
            services: monthServices,
            monthName: rotationDate.toLocaleDateString('sv-SE', { 
                month: 'long' 
            }).replace(/^[a-z]/, (match) => match.toUpperCase()),
            year: rotationDate.getFullYear()
        });
        
        // Move to next month
        rotationDate.setMonth(rotationDate.getMonth() + 1);
    }
}

// Show preview section
function showPreview() {
    previewSection.style.display = 'block';
    dateSettingsSection.style.display = 'block';
    calendarSection.style.display = 'block';
    updateRotationPreview();
}

// Hide preview section
function hidePreview() {
    previewSection.style.display = 'none';
    dateSettingsSection.style.display = 'none';
    calendarSection.style.display = 'none';
}

// Update rotation preview
function updateRotationPreview() {
    rotationPreview.innerHTML = '';
    
    rotationPlan.forEach(plan => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'rotation-month';
        
        const servicesHtml = plan.services.map(service => `
            <div class="service-info">
                <img src="${service.favicon}" alt="${service.name}" class="service-favicon" onerror="this.style.display='none'">
                <p>${service.name}</p>
            </div>
        `).join('');
        
        monthDiv.innerHTML = `
            <h4>${plan.monthName} <span class="year-text">${plan.year}</span></h4>
            <div class="month-services">
                ${servicesHtml}
            </div>
        `;
        rotationPreview.appendChild(monthDiv);
    });
}


// Generate Google Calendar URL
function generateGoogleCalendarLink() {
    if (rotationPlan.length === 0) {
        generateRotationPlan();
    }
    
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const events = [];
    
    rotationPlan.forEach(plan => {
        const startDate = formatDateForGoogle(plan.date);
        const endDate = formatDateForGoogle(new Date(plan.date.getTime() + 24 * 60 * 60 * 1000));
        const serviceNames = plan.services.map(service => service.name).join(', ');
        const title = `Streaming Rotation`;
        const monthlySchedule = generateMonthlySchedule();
        const serviceLinks = generateServiceLinks();
        const description = `Månadsupplägg:
${monthlySchedule}

Länkar för uppsägning:
${serviceLinks}

Rotera dina streamingtjänster för optimal kostnadsbesparing.`;
        
        const eventUrl = `${baseUrl}&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&recur=RRULE:FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=${rotationDay}`;
        events.push(eventUrl);
    });
    
    // Open first event in Google Calendar
    if (events.length > 0) {
        window.open(events[0], '_blank');
    }
}

// Format date for Google Calendar
function formatDateForGoogle(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate Apple Calendar (ICS file)
function generateAppleCalendar() {
    if (rotationPlan.length === 0) {
        generateRotationPlan();
    }
    
    const icsContent = generateICSContent();
    downloadICSFile(icsContent, 'streaming-rotation.ics');
}

// Generate Outlook Calendar (ICS file)
function generateOutlookCalendar() {
    if (rotationPlan.length === 0) {
        generateRotationPlan();
    }
    
    const icsContent = generateICSContent();
    downloadICSFile(icsContent, 'streaming-rotation.ics');
}

// Generate ICS content
function generateICSContent() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const monthlySchedule = generateMonthlySchedule();
    
    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Streaming Rotation//Streaming Rotation//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    rotationPlan.forEach(plan => {
        const startDate = formatDateForICS(plan.date);
        const endDate = formatDateForICS(new Date(plan.date.getTime() + 24 * 60 * 60 * 1000));
        const serviceNames = plan.services.map(service => service.name).join(', ');
        const title = `Streaming Rotation`;
        const serviceLinks = generateServiceLinks();
        const description = `Månadsupplägg:\\n${monthlySchedule}\\n\\nLänkar för uppsägning:\\n${serviceLinks}\\n\\nRotera dina streamingtjänster för optimal kostnadsbesparing.`;
        const uid = `streaming-rotation-${plan.services.map(s => s.name).join('-')}-${startDate}@streaming-rotation.com`;
        
        ics += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${timestamp}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:Streaming Rotation
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`;
    });

    ics += `END:VCALENDAR`;

    return ics;
}

// Generate monthly schedule text
function generateMonthlySchedule() {
    if (rotationPlan.length === 0) {
        generateRotationPlan();
    }
    
    let schedule = '';
    rotationPlan.forEach((plan, index) => {
        const monthName = plan.date.toLocaleDateString('sv-SE', { 
            month: 'long' 
        }).replace(/^[a-z]/, (match) => match.toUpperCase());
        const year = plan.date.getFullYear();
        const serviceNames = plan.services.map(service => service.name).join(', ');
        
        // Generate cancellation and signup instructions
        const cancellationInstructions = generateCancellationInstructions(plan, index);
        
        schedule += `${monthName} ${year}: ${serviceNames}\n${cancellationInstructions}`;
        if (index < rotationPlan.length - 1) {
            schedule += '\n\n';
        }
    });
    
    return schedule;
}

function generateCancellationInstructions(currentPlan, currentIndex) {
    let instructions = '';
    
    if (currentIndex === 0) {
        // First month - only sign up
        const serviceNames = currentPlan.services.map(service => service.name).join(', ');
        instructions = `📝 Teckna: ${serviceNames}`;
    } else {
        // Get previous month's services
        const previousPlan = rotationPlan[currentIndex - 1];
        const previousServices = previousPlan.services.map(service => service.name);
        const currentServices = currentPlan.services.map(service => service.name);
        
        // Find services to cancel (from previous month)
        const servicesToCancel = previousServices.filter(service => !currentServices.includes(service));
        
        // Find services to sign up for (new this month)
        const servicesToSignUp = currentServices.filter(service => !previousServices.includes(service));
        
        // Find services to keep (same as previous month)
        const servicesToKeep = currentServices.filter(service => previousServices.includes(service));
        
        if (servicesToCancel.length > 0) {
            instructions += `❌ Säg upp: ${servicesToCancel.join(', ')}\n`;
        }
        
        if (servicesToSignUp.length > 0) {
            instructions += `📝 Teckna: ${servicesToSignUp.join(', ')}\n`;
        }
        
        if (servicesToKeep.length > 0) {
            instructions += `✅ Behåll: ${servicesToKeep.join(', ')}`;
        }
        
        // Remove trailing newline
        instructions = instructions.trim();
    }
    
    return instructions;
}

// Generate service links for cancellation
function generateServiceLinks() {
    const serviceUrls = {
        netflix: 'https://www.netflix.com/youraccount',
        viaplay: 'https://viaplay.se/account',
        disney: 'https://www.disneyplus.com/account',
        prime: 'https://www.amazon.com/mc/account',
        max: 'https://www.hbomax.com/account',
        apple: 'https://tv.apple.com/account',
        skyshowtime: 'https://www.skyshowtime.com/account',
        tv4play: 'https://www.tv4play.se/account',
        discovery: 'https://www.discoveryplus.com/se/account'
    };
    
    let links = '';
    selectedServices.forEach((serviceId, index) => {
        const service = streamingServices[serviceId];
        const url = serviceUrls[serviceId] || '#';
        links += `${service.name}: <a href="${url}" target="_blank">${url}</a>`;
        if (index < selectedServices.length - 1) {
            links += '\n';
        }
    });
    
    return links;
}

// Format date for ICS
function formatDateForICS(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Download ICS file
function downloadICSFile(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Utility function to format dates
function formatDate(date) {
    return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).replace(/^[a-z]/, (match) => match.toUpperCase());
}

// Add some visual feedback
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Enhanced user experience features
function addEnhancedFeatures() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('service-card')) {
                e.preventDefault();
                focusedElement.click();
            }
        }
    });
    
    // Add touch support for mobile
    serviceItems.forEach(item => {
        item.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        });
        
        item.addEventListener('touchend', function(e) {
            this.style.transform = '';
        });
    });
}

// Initialize enhanced features
addEnhancedFeatures();

// Add loading states
function addLoadingState(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function removeLoadingState(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Update calendar button handlers with loading states
googleCalendarBtn.addEventListener('click', function() {
    addLoadingState(this);
    setTimeout(() => {
        generateGoogleCalendarLink();
        removeLoadingState(this);
        showNotification('Google Calendar öppnad!', 'success');
    }, 500);
});

appleCalendarBtn.addEventListener('click', function() {
    addLoadingState(this);
    setTimeout(() => {
        generateAppleCalendar();
        removeLoadingState(this);
        showNotification('Apple Calendar-fil nedladdad!', 'success');
    }, 500);
});

outlookCalendarBtn.addEventListener('click', function() {
    addLoadingState(this);
    setTimeout(() => {
        generateOutlookCalendar();
        removeLoadingState(this);
        showNotification('Outlook Calendar-fil nedladdad!', 'success');
    }, 500);
});
