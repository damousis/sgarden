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
	}),
	{
		name: "sgarden",
	},
));
