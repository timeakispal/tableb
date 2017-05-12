// Options
AccountsTemplates.configure({
    defaultLayout: 'layout',
    showForgotPasswordLink: true,
    overrideLoginErrors: true,
    enablePasswordChange: true,
    sendVerificationEmail: true,
    enforceEmailVerification: false,
    showLabels: true,
    positiveValidation:true,
    positiveFeedback:true,
    negativeValidation: true,
    negativeFeedback: true,

    // Privacy Policy and Terms of Use
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',
});

AccountsTemplates.configure({
    texts: {
        title: {
            changePwd: "Password Title",
            enrollAccount: "Enroll Title",
            forgotPwd: "Forgot my password",
            resetPwd: "Reset Pwd Title",
            signIn: "Sign In",
            signUp: "Registration",
            verifyEmail: "Verify Email Title",
        },
        button: {
          changePwd: "Password Text",
          enrollAccount: "Enroll Text",
          forgotPwd: "Reset password",
          resetPwd: "Reset Pwd Text",
          signIn: "Sign In",
          signUp: "Sign Up",
        }
    }
});


AccountsTemplates.addField({
    _id: "username",
    type: "text",
    displayName: "username",
    required: true,
    minLength: 5,
});

AccountsTemplates.removeField('email');
AccountsTemplates.addField({
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: /.+@(.+){2,}\.(.+){2,}/,
    errStr: 'Invalid email',
});

AccountsTemplates.removeField('password');
AccountsTemplates.addField({
    _id: 'password',
    type: 'password',
    required: true,
    minLength: 5,
    re: /(?=.*\d)(?=.*[a-z]).{5,}/,
    errStr: 'At least 1 digit, 1 letter',
});

AccountsTemplates.addField({
    _id: "mailing_list",
    type: "checkbox",
    displayName: "Subscribe me to mailing List",
});

//Routes
// AccountsTemplates.configureRoute('changePwd');
// AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.configureRoute('resetPwd');
// AccountsTemplates.configureRoute('signIn');
// AccountsTemplates.configureRoute('signUp');
// AccountsTemplates.configureRoute('verifyEmail');
