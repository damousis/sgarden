import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Divider, Grid, TextField, Typography } from "@mui/material";

import { SecondaryBackgroundButton, SecondaryBorderButton } from "../components/Buttons.js";
import Spinner from "../components/Spinner.js";
import { changePassword, getProfile, updateProfile } from "../api/index.js";
import { dayjs, useSnackbar } from "../utils/index.js";

const Profile = () => {
	const { success, error } = useSnackbar();
	const [isLoading, setIsLoading] = useState(false);
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isSavingPassword, setIsSavingPassword] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [feedback, setFeedback] = useState({ severity: "", message: "" });

	const [profile, setProfile] = useState(null);
	const [profileForm, setProfileForm] = useState({ username: "", email: "" });
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const loadProfile = useCallback(async () => {
		setIsLoading(true);
		try {
			const { success: isSuccess, profile: profileData, message } = await getProfile();
			if (!isSuccess) {
				const msg = message || "Failed to load profile.";
				error(msg);
				setFeedback({ severity: "error", message: msg });
				return;
			}

			setProfile(profileData);
			setProfileForm({
				username: profileData.username || "",
				email: profileData.email || "",
			});
		} catch {
			const msg = "Failed to load profile.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
		} finally {
			setIsLoading(false);
		}
	}, [error]);

	useEffect(() => {
		(async () => {
			await loadProfile();
		})();
	}, [loadProfile]);

	const createdAt = useMemo(() => (profile?.createdAt ? dayjs(profile.createdAt).format("DD/MM/YYYY HH:mm") : "-"), [profile?.createdAt]);
	const lastActiveAt = useMemo(() => (profile?.lastActiveAt ? dayjs(profile.lastActiveAt).format("DD/MM/YYYY HH:mm") : "-"), [profile?.lastActiveAt]);

	const onEditToggle = () => {
		if (isEditMode && profile) {
			setProfileForm({
				username: profile.username || "",
				email: profile.email || "",
			});
		}
		setIsEditMode((value) => !value);
	};

	const onSaveProfile = async () => {
		const username = profileForm.username.trim();
		const email = profileForm.email.trim().toLowerCase();

		if (!username || !email) {
			const msg = "Username and e-mail are required.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
			return;
		}

		setIsSavingProfile(true);
		try {
			const { success: isSuccess, message, profile: updatedProfile } = await updateProfile(username, email);
			if (!isSuccess) {
				const msg = message || "Failed to update profile.";
				error(msg);
				setFeedback({ severity: "error", message: msg });
				return;
			}

			setProfile(updatedProfile);
			setProfileForm({
				username: updatedProfile.username || "",
				email: updatedProfile.email || "",
			});
			setIsEditMode(false);
			const msg = message || "Profile updated successfully.";
			success(msg);
			setFeedback({ severity: "success", message: msg });
		} catch {
			const msg = "Failed to update profile.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
		} finally {
			setIsSavingProfile(false);
		}
	};

	const onPasswordSave = async () => {
		if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
			const msg = "Please fill in all password fields.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			const msg = "New password and confirmation must match.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
			return;
		}

		setIsSavingPassword(true);
		try {
			const { success: isSuccess, message } = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
			if (!isSuccess) {
				const msg = message || "Failed to change password.";
				error(msg);
				setFeedback({ severity: "error", message: msg });
				return;
			}

			setPasswordForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			const msg = message || "Password changed successfully.";
			success(msg);
			setFeedback({ severity: "success", message: msg });
		} catch {
			const msg = "Failed to change password.";
			error(msg);
			setFeedback({ severity: "error", message: msg });
		} finally {
			setIsSavingPassword(false);
		}
	};

	return (
		<Box data-testid="profile-page" sx={{ p: 3 }}>
			<Spinner open={isLoading || isSavingProfile || isSavingPassword} />
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h5">{"User Profile"}</Typography>
				</Grid>

				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Typography variant="caption" color="text.secondary">{"Username"}</Typography>
									{isEditMode ? (
										<TextField
											fullWidth
											size="small"
											value={profileForm.username}
											onChange={(event) => setProfileForm((prev) => ({ ...prev, username: event.target.value }))}
											data-testid="profile-username"
										/>
									) : (
										<Typography data-testid="profile-username">{profile?.username || "-"}</Typography>
									)}
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="caption" color="text.secondary">{"Email"}</Typography>
									{isEditMode ? (
										<TextField
											fullWidth
											size="small"
											value={profileForm.email}
											onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
											data-testid="profile-email"
										/>
									) : (
										<Typography data-testid="profile-email">{profile?.email || "-"}</Typography>
									)}
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="caption" color="text.secondary">{"Role"}</Typography>
									<Typography data-testid="profile-role">{profile?.role || "-"}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="caption" color="text.secondary">{"Account Created"}</Typography>
									<Typography data-testid="profile-created-at">{createdAt}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="caption" color="text.secondary">{"Last Active"}</Typography>
									<Typography data-testid="profile-last-active">{lastActiveAt}</Typography>
								</Grid>
								<Grid item xs={12} display="flex" gap={1}>
									<SecondaryBorderButton id="profile-edit-button" title={isEditMode ? "Cancel" : "Edit Profile"} onClick={onEditToggle} />
									{isEditMode && (
										<SecondaryBackgroundButton id="profile-save-button" title="Save Changes" onClick={onSaveProfile} />
									)}
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant="h6">{"Change Password"}</Typography>
							<Divider sx={{ my: 2 }} />
							<Grid container spacing={2}>
								<Grid item xs={12} sm={4}>
									<TextField
										fullWidth
										size="small"
										type="password"
										label="Current Password"
										value={passwordForm.currentPassword}
										onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
										data-testid="profile-password-current"
									/>
								</Grid>
								<Grid item xs={12} sm={4}>
									<TextField
										fullWidth
										size="small"
										type="password"
										label="New Password"
										value={passwordForm.newPassword}
										onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
										data-testid="profile-password-new"
									/>
								</Grid>
								<Grid item xs={12} sm={4}>
									<TextField
										fullWidth
										size="small"
										type="password"
										label="Confirm Password"
										value={passwordForm.confirmPassword}
										onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
										data-testid="profile-password-confirm"
									/>
								</Grid>
								<Grid item xs={12}>
									<SecondaryBackgroundButton id="profile-password-save" title="Save New Password" onClick={onPasswordSave} />
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				{feedback.severity === "success" && (
					<Grid item xs={12}>
						<Typography color="success.main" data-testid="profile-success-message">{feedback.message}</Typography>
					</Grid>
				)}
				{feedback.severity === "error" && (
					<Grid item xs={12}>
						<Typography color="error.main" data-testid="profile-error-message">{feedback.message}</Typography>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default memo(Profile);
