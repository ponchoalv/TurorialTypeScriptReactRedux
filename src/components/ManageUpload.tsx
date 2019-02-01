import * as React from "react";
import Alert from 'reactstrap/lib/Alert';
import { LoadedList, DateOfList } from 'src/types';
import UploadPrices from './ManageUpload/UploadPriceList';
import Row from 'reactstrap/lib/Row';
import Col from 'reactstrap/lib/Col';
import SelectDate from './TableComponents/SelectDate';

interface StateProps {
    loading: boolean;
    error: Error;
    selectedDate: DateOfList;
    filteredlistOptions: Array<LoadedList>;
    listsDateOptions: Array<DateOfList>;
}

interface DispatchProps {
    init: () => void;
    selectedDateChanged: (value: DateOfList) => void;
}

export type Props = StateProps & DispatchProps;

class ManageUpload extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.props.init();
    }

    render() {

        if (this.props.loading) {
            return (<p><em>Cargando...</em></p>);
        }

        if (this.props.error) {
            return (<Alert color="danger">
                Ha Ocurrido un error: {this.props.error.message}
            </Alert>)
        }

        return (
            <div>
                <h1>Administrar la carga de listas</h1>
                <p>Fecha selecionada: <b>{this.props.selectedDate.fecha}</b></p>
                <Row>
                    <Col>
                        <SelectDate listsDateOptions={this.props.listsDateOptions} selectedDate={this.props.selectedDate} selectedDateChanged={this.props.selectedDateChanged} />
                    </Col>
                </Row>
                <Row> 
                    <UploadPrices selectedDate={this.props.selectedDate} filteredlistOptions={this.props.filteredlistOptions} />
                </Row>
            </div>
        );
    }
}

export default ManageUpload;
