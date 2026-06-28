
-- =============================================
-- NEW: Payment Methods, Deposit & Withdrawal System
-- =============================================

-- Add missing analytics columns to wallets table (idempotent)
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS total_coins_purchased INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS total_diamonds_withdrawn INTEGER NOT NULL DEFAULT 0;

-- Payment methods configured by admin (PayPal, bank transfer, crypto, etc.)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('manual', 'auto', 'gateway')),
  instructions TEXT,
  instructions_ar TEXT,
  icon_emoji TEXT DEFAULT '💳',
  min_amount INTEGER NOT NULL DEFAULT 100,
  max_amount INTEGER NOT NULL DEFAULT 100000,
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  fee_fixed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  countries TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deposit requests from users (charge coins balance)
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  amount_coins INTEGER NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  reference_code TEXT,
  user_note TEXT,
  admin_note TEXT,
  reviewed_by TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  receipt_base64 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deposit_requests_user ON public.deposit_requests(user_uid);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created ON public.deposit_requests(created_at DESC);

-- Withdrawal requests from users (cash out diamonds/coins)
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  amount_coins INTEGER NOT NULL,
  amount_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  reference_code TEXT,
  destination_account TEXT,
  user_note TEXT,
  admin_note TEXT,
  reviewed_by TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_uid);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created ON public.withdrawal_requests(created_at DESC);

-- Updated triggers for new tables
CREATE OR REPLACE FUNCTION public.update_deposit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_deposit_requests_updated_at ON public.deposit_requests;
CREATE TRIGGER set_deposit_requests_updated_at
  BEFORE UPDATE ON public.deposit_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_deposit_requests_updated_at();

CREATE OR REPLACE FUNCTION public.update_withdrawal_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_withdrawal_requests_updated_at ON public.withdrawal_requests;
CREATE TRIGGER set_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_withdrawal_requests_updated_at();

CREATE OR REPLACE FUNCTION public.update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_methods_updated_at();

-- RLS policies for payment_methods (read for all auth users, write for admins)
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read active payment methods" ON public.payment_methods
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
  );

-- RLS for deposit_requests
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own deposit requests" ON public.deposit_requests
  FOR SELECT TO authenticated USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can create own deposit requests" ON public.deposit_requests
  FOR INSERT TO authenticated WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own pending deposit requests" ON public.deposit_requests
  FOR UPDATE TO authenticated USING (user_uid = auth.uid()::text AND status = 'pending');
CREATE POLICY "Admins can manage all deposit requests" ON public.deposit_requests
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
  );

-- RLS for withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT TO authenticated USING (user_uid = auth.uid()::text);
CREATE POLICY "Users can create own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT TO authenticated WITH CHECK (user_uid = auth.uid()::text);
CREATE POLICY "Users can update own pending withdrawal requests" ON public.withdrawal_requests
  FOR UPDATE TO authenticated USING (user_uid = auth.uid()::text AND status = 'pending');
CREATE POLICY "Admins can manage all withdrawal requests" ON public.withdrawal_requests
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE uid = auth.uid()::text AND role = 'admin')
  );

-- Seed default payment methods
INSERT INTO public.payment_methods (code, name, name_ar, type, icon_emoji, min_amount, max_amount, fee_percent, fee_fixed, sort_order, instructions, instructions_ar) VALUES
  ('paypal', 'PayPal', 'باي بال', 'manual', '💳', 100, 50000, 0.00, 0, 1,
   'Send payment to paypal@adendot.app and enter the transaction ID below.',
   'أرسل المبلغ إلى paypal@adendot.app وأدخل رقم العملية أدناه.'),
  ('bank_transfer', 'Bank Transfer', 'تحويل بنكي', 'manual', '🏦', 1000, 100000, 0.00, 0, 2,
   'Transfer to: Aden Dot Bank, IBAN: YE00 0000 0000 0000 0000 0000 0',
   'حوّل إلى: بنك عدن دوت، آيبان: YE00 0000 0000 0000 0000 0000 0'),
  ('usdt_trc20', 'USDT (TRC20)', 'تيثر TRC20', 'manual', '₮', 500, 100000, 0.00, 0, 3,
   'Send USDT (TRC20) to: TXxxxxxxx... and enter the TXID below.',
   'أرسل USDT (TRC20) إلى: TXxxxxxxx... وأدخل TXID أدناه.'),
  ('cash_app', 'Cash App', 'كاش أب', 'manual', '💵', 100, 10000, 0.00, 0, 4,
   'Send to $AdenDot on Cash App and enter your Cashtag below.',
   'أرسل إلى $AdenDot على Cash App وأدخل Cashtag الخاص بك أدناه.'),
  ('crypto_btc', 'Bitcoin', 'بيتكوين', 'manual', '₿', 5000, 500000, 0.00, 0, 5,
   'Send BTC to: bc1qxxxxxxxx... and enter the TXID below.',
   'أرسل BTC إلى: bc1qxxxxxxxx... وأدخل TXID أدناه.')
ON CONFLICT (code) DO NOTHING;

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposit_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_methods;

-- =============================================
-- SERVER-SIDE RPC: Send Gift (Atomic, Bypasses RLS safely)
-- =============================================
-- This function is callable by any authenticated user (RLS) but executes
-- as SECURITY DEFINER (service-role privileges) so it can update both
-- sender's and receiver's wallets atomically.

CREATE OR REPLACE FUNCTION public.send_gift(
  p_gift_type_id UUID,
  p_receiver_uid TEXT,
  p_quantity INTEGER DEFAULT 1,
  p_message TEXT DEFAULT '',
  p_post_id UUID DEFAULT NULL,
  p_live_stream_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_uid TEXT := auth.uid()::text;
  v_gift_type RECORD;
  v_sender_wallet RECORD;
  v_receiver_wallet RECORD;
  v_total_cost INTEGER;
  v_total_diamonds INTEGER;
  v_gift_id UUID;
  v_reference_code TEXT;
BEGIN
  IF v_sender_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_receiver_uid = v_sender_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_gift_self');
  END IF;

  IF p_quantity < 1 OR p_quantity > 1000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_quantity');
  END IF;

  SELECT * INTO v_gift_type FROM public.gift_types WHERE id = p_gift_type_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'gift_not_found');
  END IF;

  v_total_cost := v_gift_type.coin_cost * p_quantity;
  v_total_diamonds := v_gift_type.diamond_value * p_quantity;

  SELECT * INTO v_sender_wallet FROM public.wallets WHERE uid = v_sender_uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'sender_wallet_missing');
  END IF;

  IF v_sender_wallet.coins_balance < v_total_cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance', 'needed', v_total_cost, 'have', v_sender_wallet.coins_balance);
  END IF;

  SELECT * INTO v_receiver_wallet FROM public.wallets WHERE uid = p_receiver_uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'receiver_wallet_missing');
  END IF;

  -- Atomic deduction
  UPDATE public.wallets
  SET
    coins_balance = coins_balance - v_total_cost,
    total_coins_spent = total_coins_spent + v_total_cost
  WHERE uid = v_sender_uid AND coins_balance >= v_total_cost;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance_race');
  END IF;

  -- Credit receiver
  UPDATE public.wallets
  SET
    diamonds_balance = diamonds_balance + v_total_diamonds,
    total_diamonds_earned = total_diamonds_earned + v_total_diamonds
  WHERE uid = p_receiver_uid;

  -- Insert gift record
  INSERT INTO public.gifts (
    gift_type_id, sender_uid, receiver_uid,
    post_id, live_stream_id, quantity, message
  ) VALUES (
    p_gift_type_id, v_sender_uid, p_receiver_uid,
    p_post_id, p_live_stream_id, p_quantity, p_message
  ) RETURNING id INTO v_gift_id;

  -- Transactions
  INSERT INTO public.transactions (user_uid, type, currency, amount, description, reference_id) VALUES
    (v_sender_uid, 'gift_send', 'coins', v_total_cost,
     'Gift sent: ' || v_gift_type.name_ar || ' x' || p_quantity, v_gift_id::text),
    (p_receiver_uid, 'gift_receive', 'diamonds', v_total_diamonds,
     'Gift received: ' || v_gift_type.name_ar || ' x' || p_quantity, v_gift_id::text);

  -- Notification
  INSERT INTO public.notifications (user_uid, type, from_uid, content, reference_id)
  VALUES (p_receiver_uid, 'gift', v_sender_uid,
    'Received gift: ' || v_gift_type.name_ar || ' x' || p_quantity, v_gift_id::text);

  -- Update stream gift totals
  IF p_live_stream_id IS NOT NULL THEN
    UPDATE public.live_streams
    SET gifts_coins_total = gifts_coins_total + v_total_cost
    WHERE id = p_live_stream_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'gift_id', v_gift_id,
    'total_cost', v_total_cost,
    'total_diamonds', v_total_diamonds,
    'sender_balance', v_sender_wallet.coins_balance - v_total_cost,
    'receiver_diamonds', v_receiver_wallet.diamonds_balance + v_total_diamonds
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_gift TO authenticated;

-- =============================================
-- SERVER-SIDE RPC: Process Deposit (Admin approves a deposit)
-- =============================================
CREATE OR REPLACE FUNCTION public.process_deposit_request(
  p_request_id UUID,
  p_action TEXT,
  p_admin_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
  v_reference_code TEXT;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT * INTO v_request FROM public.deposit_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_processed');
  END IF;

  IF p_action = 'approve' THEN
    UPDATE public.deposit_requests
    SET status = 'completed',
        admin_note = p_admin_note,
        reviewed_by = v_admin_uid,
        reviewed_at = now()
    WHERE id = p_request_id;

    -- Credit user wallet
    UPDATE public.wallets
    SET coins_balance = coins_balance + v_request.amount_coins,
        total_coins_purchased = total_coins_purchased + v_request.amount_coins
    WHERE uid = v_request.user_uid;

    -- Transaction record
    INSERT INTO public.transactions (user_uid, type, currency, amount, description, reference_id)
    VALUES (v_request.user_uid, 'deposit', 'coins', v_request.amount_coins,
      'Deposit via ' || COALESCE(v_request.reference_code, '') || ' (#' || p_request_id::text || ')', p_request_id::text);

    v_reference_code := 'DEP-' || UPPER(SUBSTRING(p_request_id::text, 1, 8));
    RETURN jsonb_build_object('ok', true, 'status', 'completed', 'reference', v_reference_code);

  ELSIF p_action = 'reject' THEN
    UPDATE public.deposit_requests
    SET status = 'rejected',
        admin_note = p_admin_note,
        reviewed_by = v_admin_uid,
        reviewed_at = now()
    WHERE id = p_request_id;
    RETURN jsonb_build_object('ok', true, 'status', 'rejected');

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_deposit_request TO authenticated;

-- =============================================
-- SERVER-SIDE RPC: Process Withdrawal (Admin)
-- =============================================
CREATE OR REPLACE FUNCTION public.process_withdrawal_request(
  p_request_id UUID,
  p_action TEXT,
  p_admin_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_admin_uid TEXT := auth.uid()::text;
  v_admin_role TEXT;
  v_reference_code TEXT;
  v_user_wallet RECORD;
BEGIN
  SELECT role INTO v_admin_role FROM public.users WHERE uid = v_admin_uid;
  IF v_admin_role IS NULL OR v_admin_role != 'admin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT * INTO v_request FROM public.withdrawal_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_processed');
  END IF;

  IF p_action = 'approve' THEN
    -- Deduct user balance
    SELECT * INTO v_user_wallet FROM public.wallets WHERE uid = v_request.user_uid;
    IF v_user_wallet IS NULL OR v_user_wallet.diamonds_balance < v_request.amount_coins THEN
      -- mark as rejected due to insufficient
      UPDATE public.withdrawal_requests
      SET status = 'rejected',
          admin_note = 'Insufficient balance at processing time',
          reviewed_by = v_admin_uid,
          reviewed_at = now()
      WHERE id = p_request_id;
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance');
    END IF;

    UPDATE public.wallets
    SET diamonds_balance = diamonds_balance - v_request.amount_coins,
        total_diamonds_withdrawn = total_diamonds_withdrawn + v_request.amount_coins
    WHERE uid = v_request.user_uid;

    UPDATE public.withdrawal_requests
    SET status = 'completed',
        admin_note = p_admin_note,
        reviewed_by = v_admin_uid,
        reviewed_at = now(),
        paid_at = now()
    WHERE id = p_request_id;

    INSERT INTO public.transactions (user_uid, type, currency, amount, description, reference_id)
    VALUES (v_request.user_uid, 'withdraw', 'diamonds', v_request.amount_coins,
      'Withdrawal processed (#' || p_request_id::text || ')', p_request_id::text);

    v_reference_code := 'WTH-' || UPPER(SUBSTRING(p_request_id::text, 1, 8));
    RETURN jsonb_build_object('ok', true, 'status', 'completed', 'reference', v_reference_code);

  ELSIF p_action = 'reject' THEN
    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        admin_note = p_admin_note,
        reviewed_by = v_admin_uid,
        reviewed_at = now()
    WHERE id = p_request_id;
    RETURN jsonb_build_object('ok', true, 'status', 'rejected');

  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_action');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_withdrawal_request TO authenticated;

-- =============================================
-- HELPER RPC: Create Deposit Request (atomic, generates reference)
-- =============================================
CREATE OR REPLACE FUNCTION public.create_deposit_request(
  p_payment_method_id UUID,
  p_amount_coins INTEGER,
  p_user_note TEXT DEFAULT '',
  p_receipt_base64 TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uid TEXT := auth.uid()::text;
  v_method RECORD;
  v_request_id UUID;
  v_reference TEXT;
BEGIN
  IF v_user_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_method FROM public.payment_methods WHERE id = p_payment_method_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'method_not_found');
  END IF;

  IF p_amount_coins < v_method.min_amount OR p_amount_coins > v_method.max_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'amount_out_of_range',
      'min', v_method.min_amount, 'max', v_method.max_amount);
  END IF;

  INSERT INTO public.deposit_requests (
    user_uid, payment_method_id, amount_coins,
    amount_paid, currency, status, user_note, receipt_base64
  ) VALUES (
    v_user_uid, p_payment_method_id, p_amount_coins,
    p_amount_coins / 100.0, 'USD', 'pending', p_user_note, p_receipt_base64
  ) RETURNING id INTO v_request_id;

  v_reference := 'DEP-' || UPPER(SUBSTRING(v_request_id::text, 1, 8));

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', v_request_id,
    'reference', v_reference
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_deposit_request TO authenticated;

-- =============================================
-- HELPER RPC: Create Withdrawal Request
-- =============================================
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_payment_method_id UUID,
  p_amount_coins INTEGER,
  p_destination_account TEXT,
  p_user_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_uid TEXT := auth.uid()::text;
  v_method RECORD;
  v_wallet RECORD;
  v_request_id UUID;
  v_reference TEXT;
BEGIN
  IF v_user_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_method FROM public.payment_methods WHERE id = p_payment_method_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'method_not_found');
  END IF;

  IF p_amount_coins < v_method.min_amount OR p_amount_coins > v_method.max_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'amount_out_of_range',
      'min', v_method.min_amount, 'max', v_method.max_amount);
  END IF;

  SELECT * INTO v_wallet FROM public.wallets WHERE uid = v_user_uid;
  IF v_wallet IS NULL OR v_wallet.diamonds_balance < p_amount_coins THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance',
      'have', v_wallet.diamonds_balance, 'needed', p_amount_coins);
  END IF;

  -- Set aside the diamonds immediately to prevent double-spending
  UPDATE public.wallets
  SET diamonds_balance = diamonds_balance - p_amount_coins,
      total_diamonds_withdrawn = total_diamonds_withdrawn + p_amount_coins
  WHERE uid = v_user_uid AND diamonds_balance >= p_amount_coins;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_balance_race');
  END IF;

  INSERT INTO public.withdrawal_requests (
    user_uid, payment_method_id, amount_coins,
    amount_payout, currency, status,
    destination_account, user_note
  ) VALUES (
    v_user_uid, p_payment_method_id, p_amount_coins,
    p_amount_coins / 100.0, 'USD', 'pending',
    p_destination_account, p_user_note
  ) RETURNING id INTO v_request_id;

  v_reference := 'WTH-' || UPPER(SUBSTRING(v_request_id::text, 1, 8));

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', v_request_id,
    'reference', v_reference
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_withdrawal_request TO authenticated;
