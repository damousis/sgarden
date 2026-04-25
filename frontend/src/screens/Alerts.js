import { useMemo, useState } from "react";
import {
	Box,
	Button,
	Grid,
	IconButton,
	Paper,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import useGlobalState from "../use-global-state.js";

const metricOptions = ["Revenue", "Expenses", "Profit", "Growth Rate", "Monthly Revenue", "New Customers", "Active Subscriptions"];
const operatorOptions = [">", "<", "="];

const Alerts = () => {
	const {
		alertRules,
		triggeredAlerts,
		addAlertRule,
		toggleAlertRule,
		deleteAlertRule,
		evaluateAlerts,
	} = useGlobalState();
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		metric: metricOptions[0],
		operator: operatorOptions[0],
		threshold: "50",
	});

	const metricSnapshot = useMemo(() => ({
		Revenue: 58,
		Expenses: 72,
		Profit: 41,
		"Growth Rate": 14,
		"Monthly Revenue": 63,
		"New Customers": 8200,
		"Active Subscriptions": 45210,
	}), []);

	return (
		<Grid container py={2} flexDirection="column" data-testid="alerts-page">
			<Grid item mb={2} display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h4" color="white.main">Alerts</Typography>
				<Box display="flex" gap={1}>
					<Button
						data-testid="alerts-add-button"
						variant="contained"
						color="secondary"
						onClick={() => setShowForm(true)}
					>
						Create Alert
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => evaluateAlerts(metricSnapshot)}
					>
						Check Triggers
					</Button>
				</Box>
			</Grid>

			{showForm && (
				<Paper data-testid="alerts-form" sx={{ p: 2, mb: 2 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={4}>
							<Box data-testid="alerts-field-metric">
								<Typography variant="body2" mb={1}>Metric</Typography>
								<Dropdown
									items={metricOptions.map((metric) => ({ value: metric, text: metric }))}
									value={formData.metric}
									onChange={(event) => setFormData((prev) => ({ ...prev, metric: event.target.value }))}
									width="100%"
								/>
							</Box>
						</Grid>
						<Grid item xs={12} md={4}>
							<Box data-testid="alerts-field-operator">
								<Typography variant="body2" mb={1}>Operator</Typography>
								<Dropdown
									items={operatorOptions.map((operator) => ({ value: operator, text: operator }))}
									value={formData.operator}
									onChange={(event) => setFormData((prev) => ({ ...prev, operator: event.target.value }))}
									width="100%"
								/>
							</Box>
						</Grid>
						<Grid item xs={12} md={4} data-testid="alerts-field-threshold">
							<TextField
								label="Threshold"
								type="number"
								value={formData.threshold}
								onChange={(event) => setFormData((prev) => ({ ...prev, threshold: event.target.value }))}
								fullWidth
							/>
						</Grid>
						<Grid item xs={12} display="flex" gap={1} justifyContent="flex-end">
							<Button
								data-testid="alerts-form-cancel"
								variant="outlined"
								onClick={() => setShowForm(false)}
							>
								Cancel
							</Button>
							<Button
								data-testid="alerts-form-submit"
								variant="contained"
								color="secondary"
								onClick={() => {
									addAlertRule(formData);
									setShowForm(false);
								}}
							>
								Save Alert
							</Button>
						</Grid>
					</Grid>
				</Paper>
			)}

			{alertRules.length === 0 && (
				<Typography data-testid="alerts-empty" variant="body1" color="white.main" mb={2}>
					No alert rules yet. Create your first alert to get started.
				</Typography>
			)}

			<TableContainer component={Paper} data-testid="alerts-table" sx={{ mb: 2 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Metric</TableCell>
							<TableCell>Operator</TableCell>
							<TableCell>Threshold</TableCell>
							<TableCell>Enabled</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{alertRules.map((rule) => (
							<TableRow key={rule.id} data-testid={`alerts-row-${rule.id}`}>
								<TableCell>{rule.metric}</TableCell>
								<TableCell>{rule.operator}</TableCell>
								<TableCell>{rule.threshold}</TableCell>
								<TableCell>
									<Switch
										data-testid={`alerts-toggle-${rule.id}`}
										checked={rule.enabled}
										onChange={() => toggleAlertRule(rule.id)}
									/>
								</TableCell>
								<TableCell align="right">
									<IconButton
										data-testid={`alerts-delete-${rule.id}`}
										onClick={() => deleteAlertRule(rule.id)}
									>
										<Delete />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Paper sx={{ p: 2 }}>
				<Typography variant="h6" mb={1}>Triggered Alerts</Typography>
				<Box data-testid="alerts-triggered-list">
					{triggeredAlerts.length === 0 ? (
						<Typography variant="body2">No triggered alerts.</Typography>
					) : triggeredAlerts.map((alert) => (
						<Box
							key={alert.id}
							data-testid={`alerts-triggered-item-${alert.id}`}
							sx={{ py: 0.5 }}
						>
							<Typography variant="body2">
								{`${alert.metric} ${alert.operator} ${alert.threshold} (current: ${alert.currentValue})`}
							</Typography>
						</Box>
					))}
				</Box>
			</Paper>
		</Grid>
	);
};

export default Alerts;
