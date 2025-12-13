// DOM Elements
const linksContainer = document.getElementById('links-container');
const searchInput = document.getElementById('search-input');
const addBtn = document.getElementById('add-btn');
const addLinkModal = document.getElementById('add-link-modal');
const saveLinkBtn = document.getElementById('save-link');
const cancelLinkBtn = document.getElementById('cancel-link');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');

// Show add link modal
addBtn.addEventListener('click', () => {
    addLinkModal.style.display = 'flex';
    linkNameInput.focus();
});

// Hide add link modal
cancelLinkBtn.addEventListener('click', () => {
    addLinkModal.style.display = 'none';
    linkNameInput.value = '';
    linkUrlInput.value = '';
});

// Save link to localStorage
function saveLink(name, url) {
    if (!name || !url) return;
    
    const links = getLinks();
    const newLink = {
        id: Date.now().toString(),
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        date: new Date().toISOString(),
        important: false
    };
    
    links.unshift(newLink); // Add new link to the beginning of the array
    localStorage.setItem('links', JSON.stringify(links));
    renderLinks(links);
    
    // Reset form and hide modal
    linkNameInput.value = '';
    linkUrlInput.value = '';
    addLinkModal.style.display = 'none';
}

// Get all links from localStorage
function getLinks() {
    return JSON.parse(localStorage.getItem('links') || '[]');
}

// Delete a link
function deleteLink(id) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    const links = getLinks().filter(link => link.id !== id);
    localStorage.setItem('links', JSON.stringify(links));
    renderLinks(links);
}

// Open link in default browser
function openLink(url) {
    if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('open-external', url);
    } else {
        // Fallback for development
        window.open(url, '_blank');
    }
}

// Copy text to clipboard and show notification
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.createElement('div');
        notification.textContent = 'Copied!';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = '#333';
        notification.style.color = 'white';
        notification.style.padding = '8px 16px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    });
}

// Render links to the DOM
function renderLinks(links) {
    if (!links || !links.length) {
        linksContainer.innerHTML = `
            <div class="empty-state">
                <i class="far fa-bookmark"></i>
                <p>No links saved yet</p>
                <p style="font-size: 14px; margin-top: 8px;">Click the + button to add a new link</p>
            </div>
        `;
        return;
    }
    
    // Sort links - important first (most recent first), then non-important (most recent first)
    const sortedLinks = [...links].sort((a, b) => {
        // If both are important or both are not important, sort by date (newest first)
        if (a.important === b.important) {
            return new Date(b.date) - new Date(a.date);
        }
        // Important items come first
        return a.important ? -1 : 1;
    });

    linksContainer.innerHTML = sortedLinks.map(link => `
        <li class="link-item ${link.important ? 'important' : ''}">
            <div class="link-content">
                <div class="link-name" 
                     data-url="${link.url}" 
                     data-original-name="${link.name.replace(/"/g, '&quot;')}"
                     title="Click to show URL">
                    ${link.name}
                </div>
            </div>
            <div class="link-actions">
                <button class="action-btn copy-btn" data-url="${link.url}" title="Copy URL">
                    <i class="far fa-copy"></i>
                </button>
                <button class="action-btn open-btn" data-url="${link.url}" title="Open in browser">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${link.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="action-btn star-btn ${link.important ? 'active' : ''}" data-id="${link.id}" title="${link.important ? 'Important' : 'Mark as important'}">
                    <i class="${link.important ? 'fas' : 'far'} fa-star" ${link.important ? 'style="color: #ffd700;"' : ''}></i>
                </button>
            </div>
        </li>
    `).join('');
    
    // Add event listeners to the new elements
    document.querySelectorAll('.open-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            openLink(url);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteLink(id);
        });
    });
    
    // Add click handler for star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const starBtn = e.currentTarget;
            const linkId = starBtn.getAttribute('data-id');
            const links = getLinks();
            const linkIndex = links.findIndex(link => link.id === linkId);
            
            if (linkIndex !== -1) {
                links[linkIndex].important = !links[linkIndex].important;
                localStorage.setItem('links', JSON.stringify(links));
                renderLinks(links);
            }
        });
    });
    
    // Add click handler for copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = e.currentTarget.getAttribute('data-url');
            copyToClipboard(url);
        });
    });

    // Add click handler for link names
    document.querySelectorAll('.link-name').forEach(linkName => {
        let timeoutId;
        
        linkName.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = e.currentTarget.getAttribute('data-url');
            const originalName = e.currentTarget.getAttribute('data-original-name');
            
            // Clear any existing timeout
            if (timeoutId) clearTimeout(timeoutId);
            
            if (e.currentTarget.textContent === url) {
                // If already showing URL, just keep it displayed
                // Don't open the URL automatically
            } else {
                // Otherwise, show URL and set a timeout to revert
                e.currentTarget.textContent = url;
                e.currentTarget.title = 'Click to open';
                
                // Revert back to name after 5 seconds
                timeoutId = setTimeout(() => {
                    if (e.currentTarget.textContent === url) {
                        e.currentTarget.textContent = originalName;
                        e.currentTarget.title = 'Click to show URL';
                    }
                }, 5000);
            }
        });
    });
}

// Search functionality
function searchLinks(query) {
    const links = getLinks();
    if (!query) {
        renderLinks(links);
        return;
    }
    
    const filteredLinks = links.filter(link => 
        link.name.toLowerCase().includes(query.toLowerCase()) || 
        link.url.toLowerCase().includes(query.toLowerCase())
    );
    
    renderLinks(filteredLinks);
}

// Event Listeners
saveLinkBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (name && url) {
        saveLink(name, url);
    } else {
        alert('Please fill in both fields');
    }
});

// Handle Enter key in form inputs
linkNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        linkUrlInput.focus();
    }
});

linkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const name = linkNameInput.value.trim();
        const url = linkUrlInput.value.trim();
        
        if (name && url) {
            saveLink(name, url);
        } else {
            alert('Please fill in both fields');
        }
    }
});

searchInput.addEventListener('input', (e) => {
    searchLinks(e.target.value);
});

// Search as you type
searchInput.addEventListener('input', (e) => {
    searchLinks(e.target.value);
});

// Close modal when clicking outside
addLinkModal.addEventListener('click', (e) => {
    if (e.target === addLinkModal) {
        addLinkModal.style.display = 'none';
        linkNameInput.value = '';
        linkUrlInput.value = '';
    }
});

// Delete all links
function deleteAllLinks() {
    if (confirm('Are you sure you want to delete all links? This cannot be undone.')) {
        localStorage.removeItem('links');
        renderLinks([]);
        showNotification('All links deleted', 'success');
    }
}

// Export links to a JSON file
function exportLinks() {
    const links = getLinks();
    if (links.length === 0) {
        showNotification('No links to export', 'warning');
        return;
    }
    
    const data = JSON.stringify(links, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotroute-links-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Links exported successfully', 'success');
}

// Import links from a JSON file
function importLinks(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedLinks = JSON.parse(e.target.result);
            if (!Array.isArray(importedLinks)) {
                throw new Error('Invalid file format');
            }
            
            // Validate each link
            const validLinks = importedLinks.filter(link => 
                link && 
                typeof link === 'object' && 
                'name' in link && 
                'url' in link
            );
            
            if (validLinks.length === 0) {
                throw new Error('No valid links found in the file');
            }
            
            // Merge with existing links, avoiding duplicates by URL
            const existingLinks = getLinks();
            const existingUrls = new Set(existingLinks.map(link => link.url));
            const newLinks = validLinks.filter(link => !existingUrls.has(link.url));
            
            if (newLinks.length === 0) {
                showNotification('All links already exist', 'info');
                return;
            }
            
            const updatedLinks = [...newLinks, ...existingLinks];
            localStorage.setItem('links', JSON.stringify(updatedLinks));
            renderLinks(updatedLinks);
            showNotification(`Imported ${newLinks.length} new links`, 'success');
            
        } catch (error) {
            console.error('Error importing links:', error);
            showNotification('Error importing links: ' + error.message, 'error');
        }
    };
    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };
    reader.readAsText(file);
}

// Add event listeners for data management buttons
document.getElementById('delete-all-btn').addEventListener('click', deleteAllLinks);
document.getElementById('export-btn').addEventListener('click', exportLinks);
document.getElementById('import-btn').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importLinks(e.target.files[0]);
        e.target.value = ''; // Reset file input
    }
});

// Dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update the icon
    const darkModeIcon = document.querySelector('#dark-mode-btn i');
    if (darkModeIcon) {
        darkModeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize dark mode from localStorage
function initDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const darkModeIcon = document.querySelector('#dark-mode-btn i');
        if (darkModeIcon) darkModeIcon.className = 'fas fa-sun';
    }
}

// Add event listener for dark mode button
document.addEventListener('DOMContentLoaded', () => {
    const darkModeBtn = document.getElementById('dark-mode-btn');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', toggleDarkMode);
    }
    initDarkMode();
});

// Initialize the app
function init() {
    const links = getLinks();
    renderLinks(links);
}

// Start the app
init();
