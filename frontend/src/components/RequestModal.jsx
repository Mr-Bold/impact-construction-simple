import { useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { submitRequest } from "../services/api";
export default function RequestModal({ project, onClose }) {
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    location: "",
    workType: project?.category || "",
    contactMethod: "phone",
    description: "",
    budget: "",
    preferredStartDate: "",
  });
  const [state, setState] = useState({
    loading: false,
    error: "",
    done: false,
  });
  const update = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: "", done: false });
    try {
      await submitRequest({ ...values, projectId: project?.id });
      setState({ loading: false, error: "", done: true });
    } catch (error) {
      setState({ loading: false, error: error.message, done: false });
    }
  };
  if (!project) return null;
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        {state.done ? (
          <div className="modal-success">
            <span className="success-mark">✓</span>
            <p className="eyebrow">Request received</p>
            <h2>
              We’ll take it
              <br />
              <em>from here.</em>
            </h2>
            <p>
              Our team has received your request for similar work and will be in
              touch shortly.
            </p>
            <button className="solid-button" onClick={onClose}>
              Done <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Project enquiry</p>
            <h2 id="request-title">
              Interested in
              <br />
              <em>similar work?</em>
            </h2>
            <p className="modal-project">
              Requested project <b>{project.title}</b>
            </p>
            <form onSubmit={submit} className="request-form">
              <div className="input-row">
                <label>
                  Full name
                  <input
                    required
                    name="fullName"
                    value={values.fullName}
                    onChange={update}
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    name="phone"
                    value={values.phone}
                    onChange={update}
                  />
                </label>
              </div>
              <div className="input-row">
                <label>
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={update}
                  />
                </label>
                <label>
                  Location
                  <input
                    required
                    name="location"
                    value={values.location}
                    onChange={update}
                  />
                </label>
              </div>
              <label>
                What would you like us to do?
                <input
                  required
                  name="workType"
                  value={values.workType}
                  onChange={update}
                />
              </label>
              <label>
                Tell us about the project
                <textarea
                  required
                  name="description"
                  rows="4"
                  value={values.description}
                  onChange={update}
                />
              </label>
              {state.error && <p className="form-error">{state.error}</p>}
              <button className="solid-button" disabled={state.loading}>
                {state.loading ? "Sending..." : "Send request"}{" "}
                <ArrowUpRight size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
