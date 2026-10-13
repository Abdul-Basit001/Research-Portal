
import { useState } from "react";
import { createOpportunity } from "../services/opportunityService.js";

function OpportunityForm() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        department: "",
        deadline: "",
        status: "open"
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const result = await createOpportunity(formData);
            setMessage(result.message || "Opportunity created successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Opportunity details</h2>
            <p className="form-intro">Fields marked with * are required.</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Research title <span aria-hidden="true">*</span></label>
                <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Undergraduate Research Assistant"
                />

                <label htmlFor="description">Description <span aria-hidden="true">*</span></label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Describe the project and what the researcher will work on."
                />

                <label htmlFor="department">Department <span aria-hidden="true">*</span></label>
                <input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Biology"
                />

                <label htmlFor="deadline">Application deadline</label>
                <input
                    id="deadline"
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                />

                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? "Creating opportunity..." : "Create opportunity"}
                </button>
            </form>

            {message && <p className="success" role="status">{message}</p>}
            {error && <p className="error" role="alert">{error}</p>}
        </div>
    );
}

export default OpportunityForm;
