import {
    createStyles,
    Paper,
    Theme,
    Typography,
    WithStyles,
    withStyles,
} from '@material-ui/core';
import * as React from 'react';
import {
    connect,
    MapDispatchToPropsFunction,
} from 'react-redux';
import {
    tablePageLimit,
} from '../../api/config';
import {
    InfoTable,
    Layout,
} from '../../components';
import {
    AppState,
    getUserActivity,
    logout,
    selectTotalNumber,
    selectUserActivity,
    selectUserActivityCurrentPage,
    selectUserActivityLoading,
    UserActivityDataInterface,
} from '../../modules';

const styles = (theme: Theme) => (createStyles({
    emptyTable: {
        padding: theme.spacing.unit,
    },
    root: {
        width: '100%',
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    tableRow: {
        '&:hover': {
            backgroundColor: '#f9f9f9',
        },
    },
    title: {
        padding: theme.spacing.unit * 2.5,
        paddingBottom: 0,
    },
    selectIcon: {
        paddingLeft: '10px',
    },
}));

interface StyleProps extends WithStyles<typeof styles> {
    theme: Theme;
}

interface ReduxProps {
    loading: boolean;
    total: number;
    page: number;
    userActivity: UserActivityDataInterface[];
}

interface DispatchProps {
    getUserActivity: typeof getUserActivity;
    logout: typeof logout;
}

interface State {
    currentPage: number;
    currentLimit: number;
}

type Props = StyleProps & ReduxProps & DispatchProps;

class ActivitiesScreen extends React.Component<Props, State> {
    public readonly state = {
        currentPage: this.props.page || 0,
        currentLimit: tablePageLimit(),
    };

    private activityRows = [
        { key: 'created_at', alignRight: false, label: 'Date' },
        { key: 'user_email', alignRight: false, label: 'Email' },
        { key: 'user_role', alignRight: false, label: 'Role' },
        { key: 'action', alignRight: false, label: 'Action' },
        { key: 'result', alignRight: false, label: 'Result' },
        { key: 'user_ip', alignRight: true, label: 'IP' },
        { key: 'browser', alignRight: true, label: 'Browser' },
        { key: 'os', alignRight: true, label: 'OS' },
    ];

    public componentDidMount() {
        const {
            currentLimit,
            currentPage,
        } = this.state;
        this.props.getUserActivity({ page: currentPage, limit: currentLimit });
    }

    public render() {
        const {
            userActivity,
            loading,
            classes,
        } = this.props;
        return (
            <Layout logout={this.userLogout}>
                <Paper>
                    <Typography variant="h6" gutterBottom={true} className={classes.title}>
                        User Activities
                    </Typography>
                    {userActivity[0] && this.renderContent()}
                    {!userActivity.length && !loading && <Typography variant="caption" align="center" className={classes.emptyTable}>There is no data to show</Typography>}
                </Paper>
            </Layout>
        );
    }

    public renderContent = () => {
        const {
            userActivity,
            total,
        } = this.props;

        const {
            currentLimit,
            currentPage,
        } = this.state;

        return (
            <InfoTable
                dataLength={total}
                rows={this.activityRows}
                data={userActivity}
                page={currentPage}
                rowsPerPage={currentLimit}
                handleChangePage={this.handleChangePage}
                handleChangeRowsPerPage={this.handleChangeRowsPerPage}
                hidePagination={false}
            />
        );
    }

    private handleChangePage = (page: number) => {
        this.setState({ currentPage: page });
        this.handleGetUserActivity(this.state.currentLimit, page);
    };

    // tslint:disable-next-line:no-any
    private handleChangeRowsPerPage = (rows: number) => {
        this.setState({
            currentLimit: rows,
            currentPage: 0,
        });
        this.handleGetUserActivity(rows, 0);
    };

    private handleGetUserActivity = (limit: number, page: number) => {
        this.props.getUserActivity({ limit, page });
    }

    private userLogout = () => {
        this.props.logout();
    };
}

const mapStateToProps = (state: AppState): ReduxProps => ({
    userActivity: selectUserActivity(state),
    loading: selectUserActivityLoading(state),
    total: selectTotalNumber(state),
    page: selectUserActivityCurrentPage(state),
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, {}> =
    dispatch => ({
        getUserActivity: params => dispatch(getUserActivity(params)),
        logout: () => dispatch(logout()),
});

export const Activities = withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(ActivitiesScreen));