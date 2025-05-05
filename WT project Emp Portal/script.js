document.addEventListener("DOMContentLoaded", () => {
    fetchJobs(); // Load jobs when page loads

    document.getElementById("job-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        addJob();
    });
});

// Function to add a job
async function addJob() {
    let title = document.getElementById("job-title").value;
    let company = document.getElementById("company-name").value;
    let location = document.getElementById("job-location").value;

    const jobData = { title, company, location };

    const response = await fetch('/addJob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
    });

    if (response.ok) {
        alert("Job Added Successfully");
        fetchJobs(); // Refresh job list
        document.getElementById("job-form").reset();
    }
}

// Function to fetch and display jobs
// Function to fetch and display jobs
async function fetchJobs() {
    const response = await fetch('/jobs');
    const jobs = await response.json();

    let tableBody = document.getElementById("job-table-body");
    tableBody.innerHTML = "";

    jobs.forEach(job => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${job.company}</td>
            <td id="location-${job._id}">${job.location}</td>
            <td>
                <button onclick="editJob('${job._id}', '${job.location}')">Edit</button>
                <button onclick="deleteJob('${job._id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to edit a job location
async function editJob(id, oldLocation) {
    let newLocation = prompt("Modify the location:", oldLocation);

    if (newLocation && newLocation !== oldLocation) {
        const response = await fetch('/updateJob', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, location: newLocation })
        });

        if (response.ok) {
            alert("Job Location Updated Successfully");
            document.getElementById(`location-${id}`).textContent = newLocation; // Update UI
        } else {
            alert("Failed to update job");
        }
    }
}


// Function to delete a job
async function deleteJob(id) {
    if (confirm("Are you sure you want to delete this job?")) {
        const response = await fetch('/deleteJob', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            alert("Job Deleted Successfully");
            fetchJobs(); // Refresh job list
        }
    }
}
