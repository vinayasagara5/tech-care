function showSideBar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'flex';
}

function closeSideBar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.display = 'none';
}

async function fetchPatientData() {
    const username = 'coalition';
    const password = 'skills-test';
    const auth = btoa(`${username}:${password}`);

    try {
        const response = await fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const patients = data.map(patient => ({
            name: patient.name || '',
            age: patient.age || '',
            gender: patient.gender || '',
            profilePic: patient.profile_picture || 'default-profile-pic.png'
        }));

        const patientListContainer = document.querySelector('.left-sidebar-content');
        if (patientListContainer) {
            patients.forEach(patient => {
                const patientItem = `
                    <div class="patient-item">
                        <img src="${patient.profilePic}" alt="${patient.name}">
                        <div class="patient-info">
                            <span class="name">${patient.name}</span>
                            <span class="details">${patient.gender}, ${patient.age}</span>
                        </div>
                        <div class="more-options">
                            <img src="assest/horizontalDots.svg" alt="More Options">
                        </div>
                    </div>
                `;
                patientListContainer.insertAdjacentHTML('beforeend', patientItem);
            });
        }

        const jessica = data.find(patient => patient.name === 'Jessica Taylor');

        if (jessica) {
            const profileImage = document.querySelector('.profile-image img');
            if (profileImage) profileImage.src = jessica.profile_picture || 'default-profile-pic.png';

            const profileName = document.querySelector('.profile-name');
            if (profileName) profileName.textContent = jessica.name || '';

            const dob = document.querySelector('.profile-info-list li:nth-child(1) .info-text .detail-info');
            if (dob) dob.textContent = jessica.date_of_birth || '';

            const gender = document.querySelector('.profile-info-list li:nth-child(2) .info-text .detail-info');
            if (gender) gender.textContent = jessica.gender || '';

            const phoneNumber = document.querySelector('.profile-info-list li:nth-child(3) .info-text .detail-info');
            if (phoneNumber) phoneNumber.textContent = jessica.phone_number || '';

            const emergencyContact = document.querySelector('.profile-info-list li:nth-child(4) .info-text .detail-info');
            if (emergencyContact) emergencyContact.textContent = jessica.emergency_contact || '';

            const insuranceType = document.querySelector('.profile-info-list li:nth-child(5) .info-text .detail-info');
            if (insuranceType) insuranceType.textContent = jessica.insurance_type || '';

            const diagnosisList = document.querySelector('.table-container tbody');
            if (diagnosisList && jessica.diagnostic_list) {
                jessica.diagnostic_list.forEach(diagnosis => {
                    const row = `<tr>
                        <td>${diagnosis.name || ''}</td>
                        <td>${diagnosis.description || ''}</td>
                        <td>${diagnosis.status || ''}</td>
                    </tr>`;
                    diagnosisList.insertAdjacentHTML('beforeend', row);
                });
            }

            const labResultsList = document.querySelector('.lab-results-list');
            if (labResultsList && jessica.lab_results) {
                jessica.lab_results.forEach(result => {
                    const labItem = `<li class="lab-results-list-item">
                        <span class="lab-text">${result || ''}</span>
                        <img src="assest/download.svg" alt="Download Icon">
                    </li>`;
                    labResultsList.insertAdjacentHTML('beforeend', labItem);
                });
            }

            let highestSystolic = { value: -Infinity, level: "", month: "", year: "" };
            let lowestDiastolic = { value: Infinity, level: "", month: "", year: "" };

            const filteredData = (jessica.diagnosis_history || []).slice(0, 6).map(entry => ({
                month: entry.month || '',
                year: entry.year || '',
                blood_pressure: {
                    systolic: entry.blood_pressure?.systolic.value || 0,
                    systolic_level: entry.blood_pressure?.systolic.level || '',
                    diastolic: entry.blood_pressure?.diastolic.value || 0,
                    diastolic_level: entry.blood_pressure?.diastolic.level || ''
                }
            }));

            filteredData.forEach(entry => {
                const { systolic, systolic_level, diastolic, diastolic_level } = entry.blood_pressure;

                if (systolic > highestSystolic.value) {
                    highestSystolic = {
                        value: systolic,
                        level: systolic_level,
                        month: entry.month,
                        year: entry.year
                    };
                }

                if (diastolic < lowestDiastolic.value) {
                    lowestDiastolic = {
                        value: diastolic,
                        level: diastolic_level,
                        month: entry.month,
                        year: entry.year
                    };
                }
            });

            const chartTopValue = document.querySelector(".chart-info-top .chart-value");
            if (chartTopValue) chartTopValue.textContent = highestSystolic.value;

            const chartTopStatus = document.querySelector(".chart-info-top .chart-status span");
            if (chartTopStatus) chartTopStatus.textContent = highestSystolic.level;

            const chartBottomValue = document.querySelector(".chart-info-bottom .chart-value");
            if (chartBottomValue) chartBottomValue.textContent = lowestDiastolic.value;

            const chartBottomStatus = document.querySelector(".chart-info-bottom .chart-status span");
            if (chartBottomStatus) chartBottomStatus.textContent = lowestDiastolic.level;

            const labels = filteredData.map(item => `${item.month.slice(0, 3)}, ${item.year}`);
            const systolicValues = filteredData.map(item => item.blood_pressure.systolic);
            const diastolicValues = filteredData.map(item => item.blood_pressure.diastolic);

            const ctx = document.getElementById('bloodPressureChart')?.getContext('2d');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Stlc',
                                data: systolicValues,
                                borderColor: '#E66FD2',
                                fill: false,
                                tension: 0.4,
                                pointBackgroundColor: '#E66FD2',
                                pointBorderColor: '#E66FD2',
                            },
                            {
                                label: 'Dslc',
                                data: diastolicValues,
                                borderColor: '#8C6FE6',
                                fill: false,
                                tension: 0.4,
                                pointBackgroundColor: '#8C6FE6',
                                pointBorderColor: '#8C6FE6',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'right',
                                labels: {
                                    usePointStyle: true,
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: false },
                                grid: { display: false }
                            },
                            y: {
                                title: { display: false },
                                min: 60,
                                max: 180,
                                ticks: { stepSize: 20 }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error fetching patient data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchPatientData);
