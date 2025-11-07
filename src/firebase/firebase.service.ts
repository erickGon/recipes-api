import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  private readonly serviceAccountRelativePath = 'firebase-service-account.json';

  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccountPath = resolve(
        process.cwd(),
        this.serviceAccountRelativePath,
      );

      if (!existsSync(serviceAccountPath)) {
        throw new Error(
          `Firebase service account file not found at "${serviceAccountPath}". ` +
            'Download your service account JSON from Firebase Console and place it at that location. ' +
            'See FIREBASE_SETUP.md for details.',
        );
      }

      try {
        const fileContents = readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(fileContents) as admin.ServiceAccount;

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        const details = error instanceof Error ? error.message : `${error}`;
        throw new Error(
          `Failed to initialize Firebase Admin SDK using service account at "${serviceAccountPath}". ` +
            `Original error: ${details}.`,
        );
      }
    } else {
      this.app = admin.apps[0] as admin.app.App;
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth(this.app);
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.getAuth().verifyIdToken(idToken, true);
  }
}
