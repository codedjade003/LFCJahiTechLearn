// Create a new component: CertificateValidator.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CertificateValidator() {
  const { validationCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (validationCode) {
      // Redirect to the actual validation page with the code
      navigate(`/validate/${validationCode}`, { replace: true });
    }
  }, [validationCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Validating certificate...</p>
      </div>
    </div>
  );
}