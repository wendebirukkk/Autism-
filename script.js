// Home page functionality
let currentSection = 'videos';
let chatMessages = [];
let currentDocument = null;

// Check authentication
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Initialize page
function initializePage() {
    const user = checkAuth();
    if (user) {
        document.getElementById('user-name').textContent = `Welcome, ${user.name}!`;
        loadVideos();
        loadPhotos();
        loadDocuments();
        updateOnlineUsers();
        loadChatMessages();
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
    currentSection = sectionId;
    
    if (sectionId === 'resources') loadDocuments();
    else if (sectionId === 'chat') loadChatMessages();
    else if (sectionId === 'videos') loadVideos();
    else if (sectionId === 'photos') loadPhotos();
}

// Video functionality
function showVideoForm() {
    document.getElementById('video-form').style.display = 'block';
}

function hideVideoForm() {
    document.getElementById('video-form').style.display = 'none';
    document.getElementById('video-title').value = '';
    document.getElementById('video-url').value = '';
    document.getElementById('video-description').value = '';
}

function postVideo() {
    const title = document.getElementById('video-title').value;
    const url = document.getElementById('video-url').value;
    const description = document.getElementById('video-description').value;
    const user = checkAuth();

    if (!title || !url || !description) {
        alert('Please fill in all fields');
        return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
    }

    const video = {
        id: Date.now().toString(),
        title: title,
        videoId: videoId,
        description: description,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString()
    };

    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    videos.unshift(video);
    localStorage.setItem('videos', JSON.stringify(videos));
    loadVideos();
    hideVideoForm();
    showNotification('Video posted successfully!');
}

function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function loadVideos() {
    const videosGrid = document.getElementById('videos-grid');
    const videos = JSON.parse(localStorage.getItem('videos') || '[]');

    if (videos.length === 0) {
        videosGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video"></i>
                <h4>No Videos Yet</h4>
                <p>Be the first to share a support video!</p>
            </div>
        `;
        return;
    }

    videosGrid.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-thumbnail-container">
                <iframe class="video-thumbnail" src="https://www.youtube.com/embed/${video.videoId}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.description}</p>
                <div class="video-meta">
                    <small class="video-uploader">Posted by ${video.userName}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Photo Gallery Functionality
function showPhotoForm() {
    document.getElementById('photo-form').style.display = 'block';
}

function hidePhotoForm() {
    document.getElementById('photo-form').style.display = 'none';
    document.getElementById('photo-title').value = '';
    document.getElementById('photo-description').value = '';
    document.getElementById('photo-file').value = '';
    document.getElementById('image-preview').style.display = 'none';
}

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('preview-img');
    const previewContainer = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function uploadPhoto() {
    const title = document.getElementById('photo-title').value;
    const description = document.getElementById('photo-description').value;
    const fileInput = document.getElementById('photo-file');
    const file = fileInput.files[0];
    const user = checkAuth();

    if (!title || !description || !file) {
        alert('Please fill in all fields and select a photo');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, WEBP)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const photo = {
            id: Date.now().toString(),
            title: title,
            description: description,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileType: file.type,
            imageData: e.target.result,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString()
        };

        const photos = JSON.parse(localStorage.getItem('photos') || '[]');
        photos.unshift(photo);
        localStorage.setItem('photos', JSON.stringify(photos));
        loadPhotos();
        hidePhotoForm();
        showNotification('Photo shared successfully!');
    };
    reader.readAsDataURL(file);
}

function loadPhotos() {
    const photosGrid = document.getElementById('photos-grid');
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');

    if (photos.length === 0) {
        photosGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h4>No Photos in Gallery Yet</h4>
                <p>Share your first photo to inspire and connect with the community!</p>
            </div>
        `;
        return;
    }

    photosGrid.innerHTML = photos.map(photo => `
        <div class="photo-card" onclick="openModal('${photo.id}')">
            <div class="photo-image-container">
                <img src="${photo.imageData}" alt="${photo.title}" class="photo-image">
            </div>
            <div class="photo-info">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
                <small>Shared by ${photo.userName}</small>
                <div class="photo-actions">
                    <button onclick="event.stopPropagation(); downloadPhoto('${photo.id}')" class="download-photo-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                    ${photo.userId === JSON.parse(localStorage.getItem('currentUser')).id ? 
                        `<button onclick="event.stopPropagation(); deletePhoto('${photo.id}')" class="delete-photo-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>` : ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function openModal(photoId) {
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
        document.getElementById('modal-image').src = photo.imageData;
        document.getElementById('modal-title').textContent = photo.title;
        document.getElementById('modal-description').textContent = photo.description;
        document.getElementById('modal-uploader').textContent = `Shared by ${photo.userName}`;
        document.getElementById('photo-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    document.getElementById('photo-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function downloadPhoto(photoId) {
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
        const link = document.createElement('a');
        link.href = photo.imageData;
        link.download = photo.fileName || `autism_support_photo_${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Photo downloaded successfully!');
    }
}

function deletePhoto(photoId) {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    const photos = JSON.parse(localStorage.getItem('photos') || '[]');
    const filteredPhotos = photos.filter(photo => photo.id !== photoId);
    localStorage.setItem('photos', JSON.stringify(filteredPhotos));
    loadPhotos();
    showNotification('Photo deleted successfully!');
}

// Chat functionality
function handleKeyPress(event) {
    if (event.key === 'Enter') sendMessage();
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    const user = checkAuth();
    if (!message) return;

    const chatMessage = {
        id: Date.now().toString(),
        text: message,
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString()
    };

    chatMessages.unshift(chatMessage);
    const allMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    allMessages.unshift(chatMessage);
    localStorage.setItem('chatMessages', JSON.stringify(allMessages.slice(0, 100)));
    displayMessages();
    input.value = '';
}

function displayMessages() {
    const messagesContainer = document.getElementById('chat-messages');
    const user = checkAuth();

    if (chatMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-comments"></i>
                <h3>Welcome to Community Chat</h3>
                <p>Start a conversation with other members</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = chatMessages.map(message => `
        <div class="message ${message.userId === user.id ? 'own' : 'other'}">
            <div class="message-sender">${message.userName}</div>
            <div class="message-text">${message.text}</div>
            <time>${new Date(message.timestamp).toLocaleTimeString()}</time>
        </div>
    `).join('');
}

function loadChatMessages() {
    chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    displayMessages();
}

function updateOnlineUsers() {
    const onlineCount = Math.floor(Math.random() * 15) + 5;
    document.getElementById('online-count').textContent = onlineCount;
}

// DOCUMENT FUNCTIONALITY - FIXED BUTTONS
function showDocumentForm() {
    document.getElementById('document-form').style.display = 'block';
}

function hideDocumentForm() {
    document.getElementById('document-form').style.display = 'none';
    document.getElementById('document-title').value = '';
    document.getElementById('document-description').value = '';
    document.getElementById('document-category').value = 'educational';
    document.getElementById('document-file').value = '';
}

function uploadDocument() {
    const title = document.getElementById('document-title').value;
    const description = document.getElementById('document-description').value;
    const category = document.getElementById('document-category').value;
    const fileInput = document.getElementById('document-file');
    const file = fileInput.files[0];
    const user = checkAuth();

    if (!title || !description || !file) {
        alert('Please fill in all fields and select a file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid document file (PDF, DOC, DOCX, TXT, PPT, PPTX)');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const documentObj = {
            id: Date.now().toString(),
            title: title,
            description: description,
            category: category,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileType: file.type,
            fileData: e.target.result,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString()
        };

        const documents = JSON.parse(localStorage.getItem('documents') || '[]');
        documents.unshift(documentObj);
        localStorage.setItem('documents', JSON.stringify(documents));
        loadDocuments();
        hideDocumentForm();
        showNotification('Document uploaded successfully!');
    };
    reader.readAsDataURL(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
    if (fileType.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
}

function loadDocuments(filter = 'all') {
    const documentsGrid = document.getElementById('documents-grid');
    let documents = JSON.parse(localStorage.getItem('documents') || '[]');

    if (filter !== 'all') {
        documents = documents.filter(doc => doc.category === filter);
    }

    if (documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-upload"></i>
                <h4>No Documents Yet</h4>
                <p>Be the first to share a helpful resource!</p>
            </div>
        `;
        return;
    }

    documentsGrid.innerHTML = documents.map(doc => `
        <div class="document-card" data-category="${doc.category}">
            <div class="document-header">
                <i class="${getFileIcon(doc.fileType)} document-icon"></i>
                <div class="document-info">
                    <div class="document-title">${doc.title}</div>
                    <div class="document-description">${doc.description}</div>
                    <div class="document-file-info">
                        <i class="fas fa-info-circle"></i>
                        <span>${doc.fileName} • ${doc.fileSize}</span>
                    </div>
                    <div class="document-meta">
                        <span class="document-category">${doc.category}</span>
                        <span class="document-uploader">By ${doc.userName}</span>
                    </div>
                    <div class="document-actions">
                        <button class="download-btn" onclick="downloadDocument('${doc.id}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="view-btn" onclick="viewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${doc.userId === JSON.parse(localStorage.getItem('currentUser')).id ? 
                            `<button class="delete-btn" onclick="deleteDocument('${doc.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function viewDocument(documentId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.id === documentId);
    
    if (doc) {
        currentDocument = doc;
        document.getElementById('document-modal-title').textContent = doc.title;
        const documentViewer = document.getElementById('document-viewer');
        
        let content = '';
        if (doc.fileType.includes('pdf') || doc.fileType.includes('text')) {
            content = `
                <div class="document-content">
                    <h1>${doc.title}</h1>
                    <p><strong>Description:</strong> ${doc.description}</p>
                    <p><strong>Category:</strong> ${doc.category}</p>
                    <p><strong>Uploaded by:</strong> ${doc.userName}</p>
                    <p><strong>File:</strong> ${doc.fileName} (${doc.fileSize})</p>
                    <hr>
                    <h2>Document Content Preview</h2>
                    <p>This is a preview of "${doc.title}".</p>
                    <h3>Sample Content:</h3>
                    <p>This document contains valuable information about autism support and resources.</p>
                    <ul>
                        <li>Understanding autism spectrum</li>
                        <li>Support strategies</li>
                        <li>Community resources</li>
                        <li>Therapy options</li>
                        <li>Educational materials</li>
                    </ul>
                </div>
            `;
        } else {
            content = `
                <div class="document-content">
                    <h1>${doc.title}</h1>
                    <p>This document format requires specialized viewing software.</p>
                    <p>Please download the file to view it.</p>
                    <p><strong>File:</strong> ${doc.fileName}</p>
                    <p><strong>Size:</strong> ${doc.fileSize}</p>
                </div>
            `;
        }
        
        documentViewer.innerHTML = content;
        document.getElementById('document-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        showNotification(`Viewing "${doc.title}"`);
    } else {
        showNotification('Document not found!', 'error');
    }
}

function closeDocumentModal() {
    document.getElementById('document-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentDocument = null;
}

function downloadDocument(documentId) {
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = documents.find(d => d.id === documentId);
    
    if (doc) {
        const link = document.createElement('a');
        link.href = doc.fileData;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(`Downloading "${doc.title}"`);
    } else {
        showNotification('Document not found!', 'error');
    }
}

function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    const filteredDocuments = documents.filter(doc => doc.id !== documentId);
    localStorage.setItem('documents', JSON.stringify(filteredDocuments));
    loadDocuments();
    showNotification('Document deleted successfully!');
}

function filterResources(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadDocuments(category);
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target === document.getElementById('photo-modal')) closeModal();
    if (event.target === document.getElementById('document-modal')) closeDocumentModal();
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setInterval(updateOnlineUsers, 30000);
});