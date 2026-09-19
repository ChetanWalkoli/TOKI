import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { categories, priorityOptions, toDateInput } from '../../utils/task';

const blank = (defaults = {}) => ({ title: '', description: '', priority: defaults.defaultPriority || 'medium', category: defaults.defaultCategory || 'Personal', dueDate: toDateInput() });

export default function TaskForm({ task, defaults, onSave, onCancel }) {
  const [form, setForm] = useState(task ? { ...blank(defaults), ...task } : blank(defaults));
  const [advanced, setAdvanced] = useState(Boolean(task));
  const update = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); if (form.title.trim()) onSave({ ...form, title: form.title.trim() }); };
  return <form className="task-form" onSubmit={submit}>
    <label className="field"><span>What needs doing?</span><input name="title" value={form.title} onChange={update} placeholder="Write it here…" autoFocus required /></label>
    <button type="button" className="advanced-toggle" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>Add a few details <ChevronDown size={16} className={advanced ? 'rotated' : ''} /></button>
    {advanced && <div className="form-details">
      <label className="field"><span>Description <em>optional</em></span><textarea name="description" value={form.description} onChange={update} placeholder="A little context helps future you." rows="3" /></label>
      <div className="form-grid"><label className="field"><span>Priority</span><select name="priority" value={form.priority} onChange={update}>{priorityOptions.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label><label className="field"><span>Category</span><select name="category" value={form.category} onChange={update}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <label className="field"><span>Due date</span><input type="date" name="dueDate" value={form.dueDate} onChange={update} /></label>
    </div>}
    <div className="form-actions"><button type="button" className="button button-ghost" onClick={onCancel}>Cancel</button><button className="button button-primary" type="submit">{task ? 'Save changes' : 'Add task'} <span>→</span></button></div>
  </form>;
}
