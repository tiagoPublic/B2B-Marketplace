// SHOW SECTIONS
document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.sidebar-list-item');
    const cards = document.querySelectorAll('.card');
    const accountIcon = document.getElementById('account-icon');

    items.forEach(item => {
        item.addEventListener('click', function() {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            document.querySelectorAll('.main-content').forEach(section => {
                section.classList.remove('active');
            });

            const target = item.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', function() {
            items.forEach(i => i.classList.remove('active'));
            
            document.querySelectorAll('.main-content').forEach(section => {
                section.classList.remove('active');
            });
            const target = card.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    accountIcon.addEventListener('click', function() {
        document.querySelectorAll('.main-content').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('profile').classList.add('active');
    });

});

// SIDEBAR toggle
var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");

function openSidebar(){
    if(!sidebarOpen){
        sidebar.classList.add("sidebar-responsive");
        sidebarOpen = true;
    }
};

function closeSidebar(){
    if(sidebarOpen) {
        sidebar.classList.remove("sidebar-responsive");
        sidebarOpen = false;
    }
};

document.getElementById('out-icon').addEventListener('click', function() {
    window.location.href = '/';
});