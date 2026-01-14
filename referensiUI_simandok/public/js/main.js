// Main JavaScript for Sistem Pemantauan Dokumen

document.addEventListener('DOMContentLoaded', function () {
    console.log('Sistem Pemantauan Dokumen - Ready');

    // ================================
    // Mobile Menu Toggle
    // ================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function () {
            sidebar.classList.remove('-translate-x-full');
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', function () {
            sidebar.classList.add('-translate-x-full');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
        if (window.innerWidth < 640) {
            // sm breakpoint
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        }
    });

    // ================================
    // Tracking Dropdown Toggle
    // ================================
    const trackingBtns = document.querySelectorAll('.tracking-btn');

    trackingBtns.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const container = this.closest('.tracking-container');
            const dropdown = container.querySelector('.tracking-dropdown');

            // Close all other dropdowns
            document.querySelectorAll('.tracking-dropdown').forEach((dd) => {
                if (dd !== dropdown) {
                    dd.classList.add('hidden');
                    dd.classList.remove('show');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('hidden');
            dropdown.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.tracking-dropdown').forEach((dd) => {
            dd.classList.add('hidden');
            dd.classList.remove('show');
        });
    });

    // Prevent dropdown from closing when clicking inside
    document.querySelectorAll('.tracking-dropdown').forEach((dropdown) => {
        dropdown.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // ================================
    // File Upload Preview
    // ================================
    const fileInput = document.getElementById('document');
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const filePreview = document.getElementById('filePreview');
            const fileName = document.getElementById('fileName');
            const fileSize = document.getElementById('fileSize');

            if (file) {
                // Show preview
                filePreview.classList.remove('hidden');
                fileName.textContent = file.name;

                // Format file size
                const size = file.size;
                let sizeText = '';
                if (size < 1024) {
                    sizeText = size + ' bytes';
                } else if (size < 1024 * 1024) {
                    sizeText = (size / 1024).toFixed(2) + ' KB';
                } else {
                    sizeText = (size / (1024 * 1024)).toFixed(2) + ' MB';
                }
                fileSize.textContent = 'Ukuran: ' + sizeText;

                // Validate file size (max 10MB)
                if (size > 10 * 1024 * 1024) {
                    alert('Ukuran file terlalu besar! Maksimal 10MB');
                    fileInput.value = '';
                    filePreview.classList.add('hidden');
                }
            } else {
                filePreview.classList.add('hidden');
            }
        });
    }

    // ================================
    // Form Submission
    // ================================
    const documentForm = document.getElementById('documentForm');
    if (documentForm) {
        documentForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Mengirim...';

            // Simulate AJAX (nanti diganti dengan real API call)
            setTimeout(() => {
                alert('Dokumen berhasil diajukan!');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                window.location.href = '/';
            }, 1500);
        });
    }

    // ================================
    // Smooth Scrolling
    // ================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
});

// ================================
// Helper Functions
// ================================

function showNotification(message, type = 'info') {
    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}
