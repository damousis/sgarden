import { create } from "zustand";
import { persist } from "zustand/middleware";

export default create(persist(
	(setState) => ({
		user: {},
		setUser: (user) => setState({ user }),
		defaultPageSize: 5,
		setDefaultPageSize: (defaultPageSize) => setState({ defaultPageSize }),
		favoriteDashboards: [],
		toggleFavoriteDashboard: (dashboardPath) => setState((state) => ({
			favoriteDashboards: state.favoriteDashboards.includes(dashboardPath)
				? state.favoriteDashboards.filter((path) => path !== dashboardPath)
				: [...state.favoriteDashboards, dashboardPath],
		})),
		alertRules: [],
		triggeredAlerts: [],
		addAlertRule: ({ metric, operator, threshold }) => setState((state) => {
			const nextId = state.alertRules.reduce((maxId, rule) => Math.max(maxId, rule.id), 0) + 1;
			return {
				alertRules: [
					...state.alertRules,
					{
						id: nextId,
						metric,
						operator,
						threshold: Number(threshold),
						enabled: true,
					},
				],
			};
		}),
		toggleAlertRule: (id) => setState((state) => ({
			alertRules: state.alertRules.map((rule) => (
				rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
			)),
		})),
		deleteAlertRule: (id) => setState((state) => ({
			alertRules: state.alertRules.filter((rule) => rule.id !== id),
			triggeredAlerts: state.triggeredAlerts.filter((alert) => alert.id !== id),
		})),
		evaluateAlerts: (metrics) => setState((state) => {
			const triggeredAlerts = state.alertRules
				.filter((rule) => rule.enabled)
				.filter((rule) => {
					const currentValue = metrics?.[rule.metric];
					if (currentValue === undefined || currentValue === null) return false;
					if (rule.operator === ">") return currentValue > rule.threshold;
					if (rule.operator === "<") return currentValue < rule.threshold;
					return currentValue === rule.threshold;
				})
				.map((rule) => ({
					id: rule.id,
					metric: rule.metric,
					operator: rule.operator,
					threshold: rule.threshold,
					currentValue: metrics?.[rule.metric],
				}));
			return { triggeredAlerts };
		}),
	}),
	{
		name: "sgarden",
	},
));
