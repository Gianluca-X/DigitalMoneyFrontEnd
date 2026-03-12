import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { verifyEmail } from "../../utils/api"; // ajusta si la ruta cambia

const VerifyEmail = () => {
  const [status, setStatus] = useState("Verificando...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      setStatus("❌ Código inválido");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(code);

        setStatus("✅ Email verificado correctamente");

        setTimeout(() => navigate("/login"), 2000);

      } catch (error) {
        setStatus("❌ El código es inválido o expiró");
      }
    };

    verify();
  }, [code, navigate]);

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-screen tw-gap-6">
      <h1 className="tw-text-2xl tw-font-bold">{status}</h1>

      <Button variant="contained" onClick={() => navigate("/login")}>
        Ir al login
      </Button>
    </div>
  );
};

export default VerifyEmail;