document.addEventListener('DOMContentLoaded', async () => {
    // Function to check login status
    const checkLoginStatus = async () => {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const result = await response.json();
                if (result.loggedIn) {
                    // User is logged in, show save button and logout button if available
                    const saveButton = document.getElementById('saveButton');
                    const logoutButton = document.getElementById('logoutButton');
                    if (saveButton) saveButton.style.display = 'block';
                    if (logoutButton) logoutButton.style.display = 'block';
                } else {
                    console.log('User is not logged in or buttons not found.');
                }
            } else {
                console.error('Failed to retrieve login status');
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    // Function to handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            if (response.ok) {
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Check login status when the page loads
    await checkLoginStatus();

    // Logout button click event
    document.getElementById('logoutButton')?.addEventListener('click', async () => {
        await handleLogout();
    });

    // Fetch and mark completed items
    const fetchCompletedItems = async () => {
        try {
            const response = await fetch('/api/completed-items');
            if (response.ok) {
                const result = await response.json();
                const completedItems = result.completedItems;
                completedItems.forEach(itemId => {
                    const button = document.querySelector(`.task-button[data-item-id="${itemId}"]`);
                    if (button) {
                        button.classList.add('completed');
                    }
                });
            } else {
                console.error('Failed to retrieve completed items');
            }
        } catch (error) {
            console.error('Error fetching completed items:', error);
        }
    };

    // Handle task button clicks
    const handleTaskButtonClick = async (button) => {
        const itemId = button.getAttribute('data-item-id');
        const completed = !button.classList.contains('completed');
        try {
            const response = await fetch('/api/completed-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, completed })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.message === 'Completed items updated') {
                    button.classList.toggle('completed');
                }
            } else {
                console.error('Failed to update completed items');
            }
        } catch (error) {
            console.error('Error updating completed items:', error);
        }
    };

    // Initialize task buttons
    document.querySelectorAll('.task-button').forEach(button => {
        button.addEventListener('click', () => {
            handleTaskButtonClick(button);
        });
    });

    // Fetch completed items when the page loads
    await fetchCompletedItems();

    // Function to adjust task section margins
    const adjustTaskSectionMargins = () => {
        const topBarHeight = document.querySelector('.top-bar').offsetHeight;
        const taskSections = document.querySelectorAll('.task-section');

        taskSections.forEach(section => {
            section.style.marginTop = `${topBarHeight}px`;
        });
    };

    // Adjust task section margins on page load and resize
    adjustTaskSectionMargins();
    window.addEventListener('resize', adjustTaskSectionMargins);
});