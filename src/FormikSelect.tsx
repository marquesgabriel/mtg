import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

// Wraps the InputLabel + value/onChange/onBlur/error wiring shared by every
// Formik-bound Select in the form, instead of repeating it at each call
// site (see #60).
export default function FormikSelect({ formik, name, label, children }: {
  formik: any;
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <InputLabel id={name}>{label}</InputLabel>
      <Select
        fullWidth
        label={label}
        variant="standard"
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[name] && Boolean(formik.errors[name])}
      >
        {children}
      </Select>
    </>
  );
}
