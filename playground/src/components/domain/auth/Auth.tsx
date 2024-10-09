/**
 * A user account.
 *
 * @public
 */
export declare interface User extends UserInfo {
    /**
     * Whether the email has been verified with {@link sendEmailVerification} and
     * {@link applyActionCode}.
     */
    readonly emailVerified: boolean;
    /**
     * Whether the user is authenticated using the {@link ProviderId}.ANONYMOUS provider.
     */
    readonly isAnonymous: boolean;
    /**
     * Additional metadata around user creation and sign-in times.
     */
    readonly metadata: UserMetadata;
    /**
     * Additional per provider such as displayName and profile information.
     */
    readonly providerData: UserInfo[];
    /**
     * Refresh token used to reauthenticate the user. Avoid using this directly and prefer
     * {@link User.getIdToken} to refresh the ID token instead.
     */
    readonly refreshToken: string;
    /**
     * The user's tenant ID.
     *
     * @remarks
     * This is a read-only property, which indicates the tenant ID
     * used to sign in the user. This is null if the user is signed in from the parent
     * project.
     *
     * @example
     * ```javascript
     * // Set the tenant ID on Auth instance.
     * auth.tenantId = 'TENANT_PROJECT_ID';
     *
     * // All future sign-in request now include tenant ID.
     * const result = await signInWithEmailAndPassword(auth, email, password);
     * // result.user.tenantId should be 'TENANT_PROJECT_ID'.
     * ```
     */
    readonly tenantId: string | null;
    /**
     * Deletes and signs out the user.
     *
     * @remarks
     * Important: this is a security-sensitive operation that requires the user to have recently
     * signed in. If this requirement isn't met, ask the user to authenticate again and then call
     * one of the reauthentication methods like {@link reauthenticateWithCredential}.
     */
    delete(): Promise<void>;
    /**
     * Returns a JSON Web Token (JWT) used to identify the user to a Firebase service.
     *
     * @remarks
     * Returns the current token if it has not expired or if it will not expire in the next five
     * minutes. Otherwise, this will refresh the token and return a new one.
     *
     * @param forceRefresh - Force refresh regardless of token expiration.
     */
    getIdToken(forceRefresh?: boolean): Promise<string>;
    /**
     * Returns a deserialized JSON Web Token (JWT) used to identify the user to a Firebase service.
     *
     * @remarks
     * Returns the current token if it has not expired or if it will not expire in the next five
     * minutes. Otherwise, this will refresh the token and return a new one.
     *
     * @param forceRefresh - Force refresh regardless of token expiration.
     */
    getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
    /**
     * Refreshes the user, if signed in.
     */
    reload(): Promise<void>;
    /**
     * Returns a JSON-serializable representation of this object.
     *
     * @returns A JSON-serializable representation of this object.
     */
    toJSON(): object;
}

/**
 * A structure containing a {@link User}, the {@link OperationType}, and the provider ID.
 *
 * @remarks
 * `operationType` could be {@link OperationType}.SIGN_IN for a sign-in operation,
 * {@link OperationType}.LINK for a linking operation and {@link OperationType}.REAUTHENTICATE for
 * a reauthentication operation.
 *
 * @public
 */
export declare interface UserCredential {
    /**
     * The user authenticated by this credential.
     */
    user: User;
    /**
     * The provider which was used to authenticate the user.
     */
    providerId: string | null;
    /**
     * The type of operation which was used to authenticate the user (such as sign-in or link).
     */
    operationType: (typeof OperationType)[keyof typeof OperationType];
}

/* Excluded from this release type: UserCredentialInternal */

/**
 * User profile information, visible only to the Firebase project's apps.
 *
 * @public
 */
export declare interface UserInfo {
    /**
     * The display name of the user.
     */
    readonly displayName: string | null;
    /**
     * The email of the user.
     */
    readonly email: string | null;
    /**
     * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the
     * user.
     *
     * @remarks
     * This is null if the user has no phone credential linked to the account.
     */
    readonly phoneNumber: string | null;
    /**
     * The profile photo URL of the user.
     */
    readonly photoURL: string | null;
    /**
     * The provider used to authenticate the user.
     */
    readonly providerId: string;
    /**
     * The user's unique ID, scoped to the project.
     */
    readonly uid: string;
}

/* Excluded from this release type: UserInternal */

/**
 * Interface representing a user's metadata.
 *
 * @public
 */
export declare interface UserMetadata {
    /** Time the user was created. */
    readonly creationTime?: string;
    /** Time the user last signed in. */
    readonly lastSignInTime?: string;
}

declare class UserMetadata_2 implements UserMetadata {
    private createdAt?;
    private lastLoginAt?;
    creationTime?: string;
    lastSignInTime?: string;
    constructor(createdAt?: string | number | undefined, lastLoginAt?: string | number | undefined);
    private _initializeTime;
    _copy(metadata: UserMetadata_2): void;
    toJSON(): object;
}

/**
 * Raw encoded JWT
 *
 */
declare type IdToken = string;

/* Excluded from this release type: IdTokenMfaResponse */

/* Excluded from this release type: IdTokenResponse */

/* Excluded from this release type: IdTokenResponseKind */

/**
 * Interface representing ID token result obtained from {@link User.getIdTokenResult}.
 *
 * @remarks
 * `IdTokenResult` contains the ID token JWT string and other helper properties for getting different data
 * associated with the token as well as all the decoded payload claims.
 *
 * Note that these claims are not to be trusted as they are parsed client side. Only server side
 * verification can guarantee the integrity of the token claims.
 *
 * @public
 */
export declare interface IdTokenResult {
    /**
     * The authentication time formatted as a UTC string.
     *
     * @remarks
     * This is the time the user authenticated (signed in) and not the time the token was refreshed.
     */
    authTime: string;
    /** The ID token expiration time formatted as a UTC string. */
    expirationTime: string;
    /** The ID token issuance time formatted as a UTC string. */
    issuedAtTime: string;
    /**
     * The sign-in provider through which the ID token was obtained (anonymous, custom, phone,
     * password, etc).
     *
     * @remarks
     * Note, this does not map to provider IDs.
     */
    signInProvider: string | null;
    /**
     * The type of second factor associated with this session, provided the user was multi-factor
     * authenticated (eg. phone, etc).
     */
    signInSecondFactor: string | null;
    /** The Firebase Auth ID token JWT string. */
    token: string;
    /**
     * The entire payload claims of the ID token including the standard reserved claims as well as
     * the custom claims.
     */
    claims: ParsedToken;
}

/**
 * Enumeration of supported operation types.
 *
 * @public
 */
export declare const OperationType: {
    /** Operation involving linking an additional provider to an already signed-in user. */
    readonly LINK: "link";
    /** Operation involving using a provider to reauthenticate an already signed-in user. */
    readonly REAUTHENTICATE: "reauthenticate";
    /** Operation involving signing in a user. */
    readonly SIGN_IN: "signIn";
};

/**
 * Interface representing a parsed ID token.
 *
 * @privateRemarks TODO(avolkovi): consolidate with parsed_token in implementation.
 *
 * @public
 */
export declare interface ParsedToken {
    /** Expiration time of the token. */
    'exp'?: string;
    /** UID of the user. */
    'sub'?: string;
    /** Time at which authentication was performed. */
    'auth_time'?: string;
    /** Issuance time of the token. */
    'iat'?: string;
    /** Firebase specific claims, containing the provider(s) used to authenticate the user. */
    'firebase'?: {
        'sign_in_provider'?: string;
        'sign_in_second_factor'?: string;
        'identities'?: Record<string, string>;
    };
    /** Map of any additional custom claims. */
    [key: string]: any;
}

/**
 * Interface representing Firebase Auth service.
 *
 * @remarks
 * See {@link https://firebase.google.com/docs/auth/ | Firebase Authentication} for a full guide
 * on how to use the Firebase Auth service.
 *
 * @public
 */
export declare interface Auth {
    /** The {@link @firebase/app#FirebaseApp} associated with the `Auth` service instance. */
    // readonly app: FirebaseApp;
    /** The name of the app associated with the `Auth` service instance. */
    readonly name: string;
    /** The {@link Config} used to initialize this instance. */
    readonly config: Config;
    /**
     * Changes the type of persistence on the `Auth` instance.
     *
     * @remarks
     * This will affect the currently saved Auth session and applies this type of persistence for
     * future sign-in requests, including sign-in with redirect requests.
     *
     * This makes it easy for a user signing in to specify whether their session should be
     * remembered or not. It also makes it easier to never persist the Auth state for applications
     * that are shared by other users or have sensitive data.
     *
     * @example
     * ```javascript
     * auth.setPersistence(browserSessionPersistence);
     * ```
     *
     * @param persistence - The {@link Persistence} to use.
     */
    setPersistence(persistence: Persistence): Promise<void>;
    /**
     * The {@link Auth} instance's language code.
     *
     * @remarks
     * This is a readable/writable property. When set to null, the default Firebase Console language
     * setting is applied. The language code will propagate to email action templates (password
     * reset, email verification and email change revocation), SMS templates for phone authentication,
     * reCAPTCHA verifier and OAuth popup/redirect operations provided the specified providers support
     * localization with the language code specified.
     */
    languageCode: string | null;
    /**
     * The {@link Auth} instance's tenant ID.
     *
     * @remarks
     * This is a readable/writable property. When you set the tenant ID of an {@link Auth} instance, all
     * future sign-in/sign-up operations will pass this tenant ID and sign in or sign up users to
     * the specified tenant project. When set to null, users are signed in to the parent project.
     *
     * @example
     * ```javascript
     * // Set the tenant ID on Auth instance.
     * auth.tenantId = 'TENANT_PROJECT_ID';
     *
     * // All future sign-in request now include tenant ID.
     * const result = await signInWithEmailAndPassword(auth, email, password);
     * // result.user.tenantId should be 'TENANT_PROJECT_ID'.
     * ```
     *
     * @defaultValue null
     */
    tenantId: string | null;
    /**
     * The {@link Auth} instance's settings.
     *
     * @remarks
     * This is used to edit/read configuration related options such as app verification mode for
     * phone authentication.
     */
    readonly settings: AuthSettings;
    /**
     * Adds an observer for changes to the user's sign-in state.
     *
     * @remarks
     * To keep the old behavior, see {@link Auth.onIdTokenChanged}.
     *
     * @param nextOrObserver - callback triggered on change.
     * @param error - Deprecated. This callback is never triggered. Errors
     * on signing in/out can be caught in promises returned from
     * sign-in/sign-out functions.
     * @param completed - Deprecated. This callback is never triggered.
     */
    onAuthStateChanged(nextOrObserver: NextOrObserver<User | null>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    /**
     * Adds a blocking callback that runs before an auth state change
     * sets a new user.
     *
     * @param callback - callback triggered before new user value is set.
     *   If this throws, it blocks the user from being set.
     * @param onAbort - callback triggered if a later `beforeAuthStateChanged()`
     *   callback throws, allowing you to undo any side effects.
     */
    beforeAuthStateChanged(callback: (user: User | null) => void | Promise<void>, onAbort?: () => void): Unsubscribe;
    /**
     * Adds an observer for changes to the signed-in user's ID token.
     *
     * @remarks
     * This includes sign-in, sign-out, and token refresh events.
     *
     * @param nextOrObserver - callback triggered on change.
     * @param error - Deprecated. This callback is never triggered. Errors
     * on signing in/out can be caught in promises returned from
     * sign-in/sign-out functions.
     * @param completed - Deprecated. This callback is never triggered.
     */
    onIdTokenChanged(nextOrObserver: NextOrObserver<User | null>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
    /** The currently signed-in user (or null). */
    readonly currentUser: User | null;
    /** The current emulator configuration (or null). */
    // readonly emulatorConfig: EmulatorConfig | null;
    /**
     * Asynchronously sets the provided user as {@link Auth.currentUser} on the {@link Auth} instance.
     *
     * @remarks
     * A new instance copy of the user provided will be made and set as currentUser.
     *
     * This will trigger {@link Auth.onAuthStateChanged} and {@link Auth.onIdTokenChanged} listeners
     * like other sign in methods.
     *
     * The operation fails with an error if the user to be updated belongs to a different Firebase
     * project.
     *
     * @param user - The new {@link User}.
     */
    updateCurrentUser(user: User | null): Promise<void>;
    /**
     * Sets the current language to the default device/browser preference.
     */
    useDeviceLanguage(): void;
    /**
     * Signs out the current user. This does not automatically revoke the user's ID token.
     */
    signOut(): Promise<void>;
}

/**
 * Type definition for an event callback.
 *
 * @privateRemarks TODO(avolkovi): should we consolidate with Subscribe<T> since we're changing the API anyway?
 *
 * @public
 */
export declare type NextOrObserver<T> = NextFn<T | null> | Observer<T | null>;
export declare type NextFn<T> = (value: T) => void;
export declare interface Observer<T> {
    next: NextFn<T>;
    error: ErrorFn;
    complete: CompleteFn;
}
export declare type ErrorFn = (error: Error) => void;
export declare type CompleteFn = () => void;
export declare type Unsubscribe = () => void;

export declare interface AuthSettings {
    /**
     * When set, this property disables app verification for the purpose of testing phone
     * authentication. For this property to take effect, it needs to be set before rendering a
     * reCAPTCHA app verifier. When this is disabled, a mock reCAPTCHA is rendered instead. This is
     * useful for manual testing during development or for automated integration tests.
     *
     * In order to use this feature, you will need to
     * {@link https://firebase.google.com/docs/auth/web/phone-auth#test-with-whitelisted-phone-numbers | whitelist your phone number}
     * via the Firebase Console.
     *
     * The default value is false (app verification is enabled).
     */
    appVerificationDisabledForTesting: boolean;
}

export declare interface Persistence {
    /**
     * Type of Persistence.
     * - 'SESSION' is used for temporary persistence such as `sessionStorage`.
     * - 'LOCAL' is used for long term persistence such as `localStorage` or `IndexedDB`.
     * - 'NONE' is used for in-memory, or no persistence.
     */
    readonly type: 'SESSION' | 'LOCAL' | 'NONE';
}

export declare interface Config {
    /**
     * The API Key used to communicate with the Firebase Auth backend.
     */
    apiKey: string;
    /**
     * The host at which the Firebase Auth backend is running.
     */
    apiHost: string;
    /**
     * The scheme used to communicate with the Firebase Auth backend.
     */
    apiScheme: string;
    /**
     * The host at which the Secure Token API is running.
     */
    tokenApiHost: string;
    /**
     * The SDK Client Version.
     */
    sdkClientVersion: string;
    /**
     * The domain at which the web widgets are hosted (provided via Firebase Config).
     */
    authDomain?: string;
}

export declare interface SandwatchApp {
    /**
     * The (read-only) name for this app.
     *
     * The default app's name is `"[DEFAULT]"`.
     *
     * @example
     * ```javascript
     * // The default app's name is "[DEFAULT]"
     * const app = initializeApp(defaultAppConfig);
     * console.log(app.name);  // "[DEFAULT]"
     * ```
     *
     * @example
     * ```javascript
     * // A named app's name is what you provide to initializeApp()
     * const otherApp = initializeApp(otherAppConfig, "other");
     * console.log(otherApp.name);  // "other"
     * ```
     */
    readonly name: string;
    /**
     * The (read-only) configuration options for this app. These are the original
     * parameters given in {@link (initializeApp:1) | initializeApp()}.
     *
     * @example
     * ```javascript
     * const app = initializeApp(config);
     * console.log(app.options.databaseURL === config.databaseURL);  // true
     * ```
     */
    readonly options: FirebaseOptions;
    /**
     * The settable config flag for GDPR opt-in/opt-out
     */
    automaticDataCollectionEnabled: boolean;
}

export declare interface FirebaseOptions {
    /**
     * An encrypted string used when calling certain APIs that don't need to
     * access private user data
     * (example value: `AIzaSyDOCAbC123dEf456GhI789jKl012-MnO`).
     */
    apiKey?: string;
    /**
     * Auth domain for the project ID.
     */
    authDomain?: string;
    /**
     * Default Realtime Database URL.
     */
    databaseURL?: string;
    /**
     * The unique identifier for the project across all of Firebase and
     * Google Cloud.
     */
    projectId?: string;
    /**
     * The default Cloud Storage bucket name.
     */
    storageBucket?: string;
    /**
     * Unique numerical value used to identify each sender that can send
     * Firebase Cloud Messaging messages to client apps.
     */
    messagingSenderId?: string;
    /**
     * Unique identifier for the app.
     */
    appId?: string;
    /**
     * An ID automatically created when you enable Analytics in your
     * Firebase project and register a web app. In versions 7.20.0
     * and higher, this parameter is optional.
     */
    measurementId?: string;
}
export function getAuth(app?: SandwatchApp): Auth {
    // Your implementation here
    return {
        name: app?.name || '',
        config: {
            apiKey: '',
            apiHost: '',
            apiScheme: '',
            tokenApiHost: '',
            sdkClientVersion: ''
        },
        languageCode: null,
        tenantId: null,
        settings: {
            appVerificationDisabledForTesting: false
        },
        setPersistence: async (persistence: Persistence) => {},
        onAuthStateChanged: (nextOrObserver: NextOrObserver<User | null>, error?: ErrorFn, completed?: CompleteFn) => () => {},
        beforeAuthStateChanged: (callback: (user: User | null) => void | Promise<void>, onAbort?: () => void) => () => {},
        onIdTokenChanged: (nextOrObserver: NextOrObserver<User | null>, error?: ErrorFn, completed?: CompleteFn) => () => {},
        currentUser: null,
        updateCurrentUser: async (user: User | null) => {},
        useDeviceLanguage: () => {},
        signOut: async () => {}
    };
}
export declare function onAuthStateChanged(auth: Auth, nextOrObserver: NextOrObserver<User>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe;
