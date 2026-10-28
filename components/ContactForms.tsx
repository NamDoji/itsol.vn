"use client";

import { FormEvent, useState } from "react";

function fieldClass() {
  return "w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100";
}

export function ContactForm({ mode = "contact" }: { mode?: "contact" | "talent" }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const endpoint = mode === "talent" ? "/api/talent-requests" : "/api/contact";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (response.ok) {
      form.reset();
      setStatus("Đã gửi thông tin. ITSOL sẽ phản hồi trong thời gian sớm nhất.");
    } else {
      setStatus("Chưa gửi được. Vui lòng kiểm tra thông tin và thử lại.");
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <input className={fieldClass()} name="name" placeholder="Họ tên / Full name" required />
        <input className={fieldClass()} name="email" type="email" placeholder="Email" required />
      </div>
      <input className={fieldClass()} name="company" placeholder="Công ty / Company" required={mode === "talent"} />
      {mode === "talent" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <input className={fieldClass()} name="role" placeholder="Vị trí cần tuyển" required />
            <input className={fieldClass()} name="seniority" placeholder="Seniority" />
            <input className={fieldClass()} name="quantity" type="number" min="1" placeholder="Số lượng" />
          </div>
          <input className={fieldClass()} name="timeline" placeholder="Timeline mong muốn" />
          <textarea className={fieldClass()} name="notes" rows={5} placeholder="Mô tả JD, kỹ năng, ngân sách, ghi chú" />
        </>
      ) : (
        <textarea className={fieldClass()} name="message" rows={6} placeholder="Nội dung cần trao đổi" required />
      )}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Đang gửi..." : mode === "talent" ? "Gửi yêu cầu nhân sự" : "Gửi liên hệ"}
      </button>
      {status ? <p className="text-sm font-semibold text-brand-navy">{status}</p> : null}
    </form>
  );
}
