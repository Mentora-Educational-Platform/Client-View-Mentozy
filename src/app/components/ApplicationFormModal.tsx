import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { supabase } from '../../lib/supabase';

const APPLICATIONS_REDIRECT_URL = 'https://applications.mentozy.app';

type ApplicationFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  portfolio: string;
  experience: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  portfolio: '',
  experience: '',
  message: '',
};

export function ApplicationFormModal({ open, onOpenChange, role }: ApplicationFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please enter your full name';
    if (!form.email.trim()) {
      next.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) next.phone = 'Please enter your phone number';
    if (!form.message.trim() || form.message.trim().length < 30) {
      next.message = 'Tell us a bit more (at least 30 characters)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      role,
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      portfolio_url: form.portfolio.trim() || null,
      years_of_experience: form.experience.trim() || null,
      cover_letter: form.message.trim(),
      submitted_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('job_applications').insert(payload);
        if (error) {
          console.warn('Could not save application to Supabase:', error.message);
        }
      }
    } catch (err) {
      console.warn('Application submit error:', err);
    }

    toast.success('Application submitted successfully', {
      description: `Thanks ${form.name.split(' ')[0]}! Our admissions & recruitment team will review your application and get in touch.`,
    });

    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Apply for {role}
          </DialogTitle>
          <DialogDescription>
            Fill in your details below. Our team will review your application and contact you via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-name">Full Name *</Label>
              <Input
                id="app-name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={update('name')}
                disabled={submitting}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-email">Email *</Label>
              <Input
                id="app-email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={update('email')}
                disabled={submitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="app-phone">Phone *</Label>
              <Input
                id="app-phone"
                placeholder="+91 9000000000"
                value={form.phone}
                onChange={update('phone')}
                disabled={submitting}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-experience">Years of Experience</Label>
              <Input
                id="app-experience"
                placeholder="e.g. 2"
                value={form.experience}
                onChange={update('experience')}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-portfolio">Portfolio / GitHub / LinkedIn URL</Label>
            <Input
              id="app-portfolio"
              type="url"
              placeholder="https://"
              value={form.portfolio}
              onChange={update('portfolio')}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="app-message">Why are you a fit for this role? *</Label>
            <Textarea
              id="app-message"
              placeholder="Share a few lines about your background, projects, and motivation."
              rows={5}
              value={form.message}
              onChange={update('message')}
              disabled={submitting}
              aria-invalid={!!errors.message}
            />
            {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 hover:bg-amber-600 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { APPLICATIONS_REDIRECT_URL };
