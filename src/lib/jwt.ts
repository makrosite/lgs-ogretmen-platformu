import { SignJWT, jwtVerify } from "jose";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "lgs-jwt-secret-change-in-prod-32chars!!"
  );

export type FormTokenPayload = {
  type: "form";
  examId: string;
  studentId: string;
  linkId: string;
};

export type ReportTokenPayload = {
  type: "report";
  studentId: string;
  examResultId: string;
};

export async function signFormToken(
  payload: Omit<FormTokenPayload, "type">,
  expiresIn = process.env.JWT_EXPIRES_IN || "48h"
) {
  return new SignJWT({ ...payload, type: "form" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function signReportToken(
  payload: Omit<ReportTokenPayload, "type">,
  expiresIn = "30d"
) {
  return new SignJWT({ ...payload, type: "report" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken<T extends FormTokenPayload | ReportTokenPayload>(
  token: string
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export function calcNet(correct: number, wrong: number) {
  return Math.round((correct - wrong / 3) * 100) / 100;
}

export function estimateLgsScore(totalNet: number) {
  // Rough LGS projection: ~100 + net * 4.2 (demo formula)
  const score = Math.min(500, Math.max(100, Math.round(100 + totalNet * 4.2)));
  const percentile = Math.max(0.1, Math.min(99, Math.round((500 - score) / 5 * 10) / 10));
  return { score, percentile };
}
