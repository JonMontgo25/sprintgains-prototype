/**
 * Sprintgains Prototype Application Logic
 * Mocks a temporary state using JS variables and DOM manipulation.
 */

const app = {
    // --- State (Mock Data) ---
    state: {
        activeView: 'dashboard',
        sprint: {
            startDate: "2023-10-16", // Hardcoded Monday
            endDate: "2023-10-29",
            goals: ["Run 20 miles total", "Strength train 3x per week", "Stretch daily"],
            daysRemaining: 10,
            currentDayIndex: 4 // Day 5 (Friday) to show some past history
        },
        activities: [
            // History (Days 0-3)
            { id: 1, dayIndex: 0, name: 'Morning 5k Run', type: 'Running', metricType: 'Distance', goal: '3.1 mi', status: 'success', notes: 'Felt great' },
            { id: 2, dayIndex: 0, name: 'Stretching', type: 'Stretching', metricType: 'Time', goal: '15 mins', status: 'partial', notes: 'Only did 10 mins' },
            { id: 3, dayIndex: 1, name: 'Upper Body Lift', type: 'Strength', metricType: 'Time', goal: '45 mins', status: 'success', notes: 'Hit all PRs' },
            { id: 4, dayIndex: 2, name: 'Recovery Walk', type: 'Walking', metricType: 'Distance', goal: '2 mi', status: 'failed', notes: 'Rained out' },
            { id: 5, dayIndex: 3, name: 'Lower Body Lift', type: 'Strength', metricType: 'Time', goal: '45 mins', status: 'success', notes: '' },
            
            // Today (Day 4)
            { id: 6, dayIndex: 4, name: 'Tempo Run', type: 'Running', metricType: 'Distance', goal: '4 mi', status: 'none', notes: '' },
            { id: 7, dayIndex: 4, name: 'Core Workout', type: 'Strength', metricType: 'Time', goal: '15 mins', status: 'none', notes: '' },

            // Future (Days 5+)
            { id: 8, dayIndex: 5, name: 'Long Run', type: 'Running', metricType: 'Distance', goal: '8 mi', status: 'none', notes: '' },
            { id: 9, dayIndex: 7, name: 'Upper Body Lift', type: 'Strength', metricType: 'Time', goal: '45 mins', status: 'none', notes: '' },
        ],
        retroNotes: {
            well: ["Hit my running mileage for week 1"],
            poor: ["Struggled to stretch every day"],
            different: ["Schedule stretches right after my runs"]
        },
        
        // Modal State tracking
        currentModalActivityId: null,
        currentActivityStatusSelection: null
    },

    // --- Initialization ---
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderAll();
    },

    cacheDOM() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.viewSections = document.querySelectorAll('.view-section');
    },

    bindEvents() {
        // Navigation clicks
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Notes character count
        const notesTextArea = document.getElementById('activity-notes');
        const charCount = document.querySelector('.char-count');
        if (notesTextArea && charCount) {
            notesTextArea.addEventListener('input', (e) => {
                charCount.textContent = `${e.target.value.length} / 500`;
            });
        }

        // Status Selection in Complete Modal
        const statusBtns = document.querySelectorAll('.status-btn');
        statusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                statusBtns.forEach(b => b.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.state.currentActivityStatusSelection = e.currentTarget.dataset.status;
            });
        });

        // Close dropdown when clicking outside
        window.onclick = function(event) {
            if (!event.target.matches('.icon-btn') && !event.target.closest('.icon-btn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                for (var i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
    },

    // --- Navigation Logic ---
    switchView(viewId) {
        // Update Nav UI
        this.navItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`.nav-item[data-view="${viewId}"]`).classList.add('active');

        // Update View UI
        this.viewSections.forEach(section => section.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        this.state.activeView = viewId;
        
        // Re-render based on view to ensure fresh mock data calculation
        this.renderAll();
    },

    // --- Modal Logic ---
    openModal(modalId, activityId = null) {
        // Setup state if editing/completing existing activity
        if (activityId !== null) {
            this.state.currentModalActivityId = activityId;
            const activity = this.state.activities.find(a => a.id === activityId);
            
            if (modalId === 'edit-activity-modal') {
                document.getElementById('activity-modal-title').textContent = 'Edit Activity';
                document.getElementById('activity-name').value = activity.name;
                document.getElementById('activity-type').value = activity.type;
                document.getElementById('activity-metric-type').value = activity.metricType;
                document.getElementById('activity-goal').value = activity.goal;
                document.getElementById('delete-activity-btn').style.display = 'block';
            } else if (modalId === 'complete-activity-modal') {
                document.getElementById('complete-activity-name').textContent = activity.name;
                document.getElementById('activity-notes').value = activity.notes || '';
                
                // Set Status visually
                document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('selected'));
                this.state.currentActivityStatusSelection = null;
                if (activity.status && activity.status !== 'none') {
                    const btn = document.querySelector(`.status-btn[data-status="${activity.status}"]`);
                    if(btn) {
                        btn.classList.add('selected');
                        this.state.currentActivityStatusSelection = activity.status;
                    }
                }
                
                // Trigger char count update
                document.getElementById('activity-notes').dispatchEvent(new Event('input'));
            }
        } else {
            // New creation resets
            if (modalId === 'edit-activity-modal') {
                document.getElementById('activity-modal-title').textContent = 'Add Activity';
                document.getElementById('activity-form').reset();
                document.getElementById('delete-activity-btn').style.display = 'none';
                this.state.currentModalActivityId = null;
            }
        }

        document.getElementById(modalId).classList.add('show');
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    },

    // --- Rendering logic ---
    renderAll() {
        this.renderDashboard();
        this.renderCalendar();
        this.renderRetro();
    },

    renderDashboard() {
        // Date Text
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        document.getElementById('dashboard-date').textContent = `${days[this.state.currentDayIndex % 7]}, Day ${this.state.currentDayIndex + 1} of 14`;
        document.getElementById('dashboard-days-remaining').textContent = this.state.sprint.daysRemaining;

        const dashboardActContainer = document.getElementById('dashboard-activities');
        
        // Get today's activities based on mock currentDayIndex
        const todaysActivities = this.state.activities.filter(a => a.dayIndex === this.state.currentDayIndex);
        
        if (todaysActivities.length === 0) {
            dashboardActContainer.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center;">No activities planned for today.</p>`;
        } else {
            let html = '';
            todaysActivities.forEach(act => {
                html += `
                <div class="activity-card" data-status="${act.status}">
                    <div class="activity-info" onclick="app.openModal('edit-activity-modal', ${act.id})">
                        <div class="activity-title">${act.name}</div>
                        <div class="activity-meta">
                            <span>${act.type}</span>
                            <span>•</span>
                            <span>Goal: ${act.goal}</span>
                        </div>
                    </div>
                    <div class="activity-actions">
                        <button class="btn btn-outline btn-sm" onclick="app.openModal('complete-activity-modal', ${act.id}); event.stopPropagation();">
                            ${act.status !== 'none' ? 'Update Status' : 'Complete'}
                        </button>
                    </div>
                </div>
                `;
            });
            dashboardActContainer.innerHTML = html;
        }
        
        // Render Goals
        const goalsList = document.getElementById('dashboard-goals-list');
        goalsList.innerHTML = this.state.sprint.goals.map(g => `<li>${g}</li>`).join('');
    },

    renderCalendar() {
        // Goals
        const calendarGoalsList = document.getElementById('calendar-goals-list');
        calendarGoalsList.innerHTML = this.state.sprint.goals.map(g => `<li>${g}</li>`).join('');

        const grid = document.getElementById('sprint-calendar-grid');
        let html = '';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Build 14 day blocks
        for(let i=0; i<14; i++) {
            const dayActs = this.state.activities.filter(a => a.dayIndex === i);
            
            let actsHtml = '';
            dayActs.forEach(a => {
                actsHtml += `<div class="cal-activity-badge s-${a.status}">${a.name}</div>`;
            });
            
            const isToday = i === this.state.currentDayIndex ? 'style="border-color: var(--accent-primary);"' : '';

            // Day title calculation
            const weekDay = days[i % 7];
            const weekNum = i < 7 ? 1 : 2;

            html += `
            <div class="calendar-day" ${isToday} onclick="app.openDayDetails(${i})">
                <div class="day-header">
                    <span>${weekDay}</span>
                    <span class="text-muted text-small">W${weekNum} D${(i%7)+1}</span>
                </div>
                <div class="day-activities">
                    ${actsHtml}
                </div>
            </div>
            `;
        }
        
        grid.innerHTML = html;
    },

    renderRetro() {
        // Calculate Stats
        const totalCompleted = this.state.activities.filter(a => a.status !== 'none').length;
        if (totalCompleted > 0) {
            const success = this.state.activities.filter(a => a.status === 'success').length;
            const partial = this.state.activities.filter(a => a.status === 'partial').length;
            const failed = this.state.activities.filter(a => a.status === 'failed').length;

            document.getElementById('retro-stat-success').textContent = Math.round((success/totalCompleted)*100) + '%';
            document.getElementById('retro-stat-partial').textContent = Math.round((partial/totalCompleted)*100) + '%';
            document.getElementById('retro-stat-failed').textContent = Math.round((failed/totalCompleted)*100) + '%';
        }

        // Render Sidebar Days List
        const daysListContainer = document.getElementById('retro-days-list');
        let daysHtml = '';
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for(let i=0; i<14; i++) {
            const dayActs = this.state.activities.filter(a => a.dayIndex === i && a.status !== 'none');
            
            if (dayActs.length === 0 && i > this.state.currentDayIndex) continue; // Skip future empty days
            
            const title = `Day ${i+1} (${days[i%7]})`;
            let actsHtml = dayActs.length > 0 ? '' : '<span class="text-muted text-small">No activity</span>';
            
            dayActs.forEach(act => {
                let iconColor = 'text-muted';
                if(act.status === 'success') iconColor = 'text-success';
                if(act.status === 'partial') iconColor = 'text-warning';
                if(act.status === 'failed') iconColor = 'text-danger';

                actsHtml += `
                <div class="retro-day-act-item">
                    <span class="status-indicator status-${act.status}"></span>
                    <span>${act.name}</span>
                </div>`;
            });

            daysHtml += `
            <div class="retro-day-block" onclick="app.openDayDetails(${i})">
                <div class="retro-day-header">${title}</div>
                <div class="retro-day-act-summary">
                    ${actsHtml}
                </div>
            </div>
            `;
        }
        daysListContainer.innerHTML = daysHtml || '<p class="text-muted text-small">No activities logged yet.</p>';

        // Render Notes Lists
        this.renderNotesList('well', 'notes-well-list');
        this.renderNotesList('poor', 'notes-poor-list');
        this.renderNotesList('different', 'notes-different-list');
    },

    renderNotesList(categoryKey, elementId) {
        const listEl = document.getElementById(elementId);
        const notes = this.state.retroNotes[categoryKey];
        if (notes.length === 0) {
            listEl.innerHTML = '<li class="text-muted text-small" style="background:transparent; padding:0;">No notes added.</li>';
        } else {
            listEl.innerHTML = notes.map((n, index) => `
                <li>
                    <span>${n}</span>
                    <button onclick="app.deleteRetroNote('${categoryKey}', ${index})">✕</button>
                </li>
            `).join('');
        }
    },

    addRetroNote(category) {
        const inputMap = {
            'well': 'note-well-input',
            'poor': 'note-poor-input',
            'different': 'note-different-input'
        };
        const inputId = inputMap[category];
        const inputEl = document.getElementById(inputId);
        const val = inputEl.value.trim();
        
        if (val) {
            this.state.retroNotes[category].push(val);
            inputEl.value = '';
            this.renderRetro();
        }
    },

    deleteRetroNote(category, index) {
        this.state.retroNotes[category].splice(index, 1);
        this.renderRetro();
    },

    // --- Action Handlers ---
    openDayDetails(dayIndex) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        document.getElementById('day-details-title').textContent = `Day ${dayIndex + 1} (${days[dayIndex%7]}) Details`;
        
        const container = document.getElementById('day-details-activities');
        const dayActs = this.state.activities.filter(a => a.dayIndex === dayIndex);
        
        if (dayActs.length === 0) {
            container.innerHTML = `<p class="text-muted">No activities planned for this day.</p>`;
        } else {
            let html = '<div class="activity-list">';
            dayActs.forEach(act => {
                html += `
                <div class="activity-card" data-status="${act.status}">
                    <div class="activity-info">
                        <div class="activity-title">${act.name}</div>
                        <div class="activity-meta">
                            <span>${act.type}</span>
                            <span>•</span>
                            <span>Goal: ${act.goal}</span>
                        </div>
                        ${act.notes ? `<div class="mt-2 text-small text-muted"><i>" ${act.notes} "</i></div>` : ''}
                    </div>
                    <div class="activity-actions">
                        <button class="btn btn-outline btn-sm" onclick="app.closeModal('day-details-modal'); app.openModal('complete-activity-modal', ${act.id});">
                            Status
                        </button>
                    </div>
                </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }

        this.openModal('day-details-modal');
    },

    // Activity Handlers
    saveActivity() {
        const name = document.getElementById('activity-name').value;
        const type = document.getElementById('activity-type').value;
        const metricType = document.getElementById('activity-metric-type').value;
        const goal = document.getElementById('activity-goal').value;

        if (!name || !goal) {
            this.showToast('Name and Goal are required.');
            return;
        }

        if (this.state.currentModalActivityId) {
            // Edit
            const act = this.state.activities.find(a => a.id === this.state.currentModalActivityId);
            act.name = name;
            act.type = type;
            act.metricType = metricType;
            act.goal = goal;
            this.showToast('Activity updated.');
        } else {
            // New (mock limit to 2 per day)
            const dayActs = this.state.activities.filter(a => a.dayIndex === this.state.currentDayIndex);
            if (dayActs.length >= 2) {
                this.showToast('Maximum 2 activities per day reached limit.');
                return;
            }

            const newId = this.state.activities.length > 0 ? Math.max(...this.state.activities.map(a => a.id)) + 1 : 1;
            this.state.activities.push({
                id: newId,
                dayIndex: this.state.currentDayIndex,
                name,
                type,
                metricType,
                goal,
                status: 'none',
                notes: ''
            });
            this.showToast('Activity added.');
        }

        this.closeModal('edit-activity-modal');
        this.renderAll();
    },

    confirmDeleteActivity() {
        if(confirm("Are you sure you want to delete this activity?")) {
            this.state.activities = this.state.activities.filter(a => a.id !== this.state.currentModalActivityId);
            this.closeModal('edit-activity-modal');
            this.renderAll();
            this.showToast('Activity deleted.');
        }
    },

    submitCompletion() {
        if (!this.state.currentActivityStatusSelection) {
            this.showToast('Please select a status colored button.');
            return;
        }

        const act = this.state.activities.find(a => a.id === this.state.currentModalActivityId);
        act.status = this.state.currentActivityStatusSelection;
        act.notes = document.getElementById('activity-notes').value;

        this.closeModal('complete-activity-modal');
        this.renderAll();
        
        // Also update retro stats simply by re-rendering if active
        // But for mock prototype, we'll just show toast
        this.showToast('Activity status saved.');
    },

    // --- Utils ---
    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => app.init());
