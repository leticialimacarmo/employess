$(window).on("load", async function () {
  const employees = new Employees();
  await employees.init();
});

class Employees {
  constructor() {}

  async init() {
    await this.initDatatable();
    this.formatValues();
    this.registerEmployees();
    this.setupUpdateModal();
    this.deleteEmployees();

    $("#nome").val("");
    $("#cpf").val("");
    $("#data_nascimento").val("");
    $("#email").val("");
  }

  async initDatatable() {
    const self = this;
    if ($.fn.DataTable) {
      self.table = $("#dataTable").DataTable({
        processing: true,
        serverSide: true,
        ajax: {
          url: "http://localhost:3000/api/employees",
          type: "GET",
          dataSrc: function (json) {
            return json.data;
          },
        },
        columns: [
          { data: "id", visible: false },
          { data: "nome" },
          { data: "cpf" },
          { data: "data_nascimento" },
          { data: "email" },
          {
            data: "data_cadastro",
            render: function (data) {
              return data ? new Date(data).toLocaleDateString() : "";
            },
          },
          {
            data: null,
            render: function (data, type, row) {
              return `
                <button type="button" class="btn btn-warning btn-sm update-btn" data-id="${row.id}" data-toggle="modal" data-target="#updateModal">
                    <i class="bi bi-pencil-square"></i> 
                </button>
                <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${row.id}">
                    <i class="bi bi-trash"></i> 
                </button>
              `;
            },
          },
        ],
      });
    }
  }

  formatValues() {
    this.formatCpf("#cpf");
    this.formatCpf("#cpf_update");

    this.validateBirthDate("#data_nascimento");
    this.validateBirthDate("#dataNascimento_update");

    this.validateEmail("#email");
    this.validateEmail("#email_update");
  }

  formatCpf(selector) {
    $(selector).on("input", function (event) {
      let value = $(this).val();
      value = value.replace(/\D/g, "");
      value = value.substring(0, 11);

      if (value.length > 3 && value.length <= 6) {
        value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
      } else if (value.length > 6 && value.length <= 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
      } else if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
      }

      $(selector).val(value);
    });
  }

  validateBirthDate(selector) {
    $(selector).on("change", function () {
      let birthDate = new Date($(this).val());
      let today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      let monthDiff = today.getMonth() - birthDate.getMonth();
      let dayDiff = today.getDate() - birthDate.getDate();

      if (
        age < 18 ||
        age > 100 ||
        (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0))) ||
        (age === 100 && (monthDiff > 0 || (monthDiff === 0 && dayDiff > 0)))
      ) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Data de Nascimento Inválida.",
        });
        $(this).val("");
        return;
      }
    });
  }

  validateEmail(selector) {
    $(selector).on("change", function () {
      let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test($(this).val())) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Email Inválido.",
        });
        $(this).val("");
        return;
      }
    });
  }

  validateField(fieldName) {
    const form = $("#formCadastro")[0];
    if (!form) return false;

    const input = $(form).find(`[name="${fieldName}"]`);
    const inputValue = input.val().trim();
    const errorMessage = `${fieldName} é obrigatório`;

    if (!inputValue) {
      if (!input.next(".invalid-feedback").length) {
        const errorDiv = $("<div>")
          .addClass("invalid-feedback")
          .text(errorMessage);
        input.after(errorDiv);
      }
      input.addClass("is-invalid");
      return false;
    } else {
      input.removeClass("is-invalid");
      input.next(".invalid-feedback").remove();
      return true;
    }
  }

  registerEmployees() {
    const self = this;

    $(document).on("click", "#register", async function (e) {
      e.preventDefault();

      const fieldsToValidate = ["nome", "cpf", "data_nascimento", "email"];
      const validations = fieldsToValidate.map((fieldName) =>
        self.validateField(fieldName)
      );

      if (validations.every((valid) => valid)) {
        const data = {
          nome: $("#nome").val(),
          cpf: $("#cpf").val(),
          data_nascimento: $("#data_nascimento").val(),
          email: $("#email").val(),
        };

        const apiUrl = `http://localhost:8080/api/employees`;

        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };

        fetch(apiUrl, requestOptions)
          .then((response) => {
            if (!response.ok) {
              return response.json().then((error) => Promise.reject(error));
            }
            return response.json();
          })
          .then((data) => {
            Swal.fire({
              icon: "success",
              title: "Registro realizado!",
              text: "Seu registro foi salvo com sucesso.",
            }).then((result) => {
              if (result.isConfirmed) location.reload();
            });
          })
          .catch((error) => {
            console.error("Erro ao fazer requisição:", error);
            Swal.fire({
              icon: "error",
              title: "Erro!",
              text:
                error.message ||
                "Erro ao salvar registro. Por favor, tente novamente.",
            });
          });

        $("#nome").val("");
        $("#cpf").val("");
        $("#data_nascimento").val("");
        $("#email").val("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Preencha todos os campos obrigatórios antes de prosseguir.",
        });
      }
    });
  }

  setupUpdateModal() {
    const self = this;

    $(document).on("click", ".update-btn", function (e) {
      e.preventDefault();

      const rowId = $(this).data("id");
      const rowData = self.table.row($(this).closest("tr")).data();

      $("#nome_update").val(rowData.nome);
      $("#cpf_update").val(rowData.cpf);
      $("#dataNascimento_update").val(rowData.data_nascimento);
      $("#email_update").val(rowData.email);
      $("#updateModal").data("employee-id", rowId);
    });

    $(document).on("click", "#update", async function (e) {
      e.preventDefault();

      const data = {
        id: $("#updateModal").data("employee-id"),
        nome: $("#nome_update").val(),
        cpf: $("#cpf_update").val(),
        data_nascimento: $("#dataNascimento_update").val(),
        email: $("#email_update").val(),
      };

      const apiUrl = `http://localhost:8080/api/employees/${data.id}`;

      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      fetch(apiUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            return response.json().then((error) => Promise.reject(error));
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            icon: "success",
            title: "Funcionário atualizado!",
            text: "Os dados do funcionário foram atualizados com sucesso.",
          }).then((result) => {
            if (result.isConfirmed) {
              $("#updateModal").modal("hide");
              location.reload();
            }
          });
        })
        .catch((error) => {
          console.error("Erro ao fazer requisição:", error);
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text:
              error.message ||
              "Erro ao atualizar registro. Por favor, tente novamente.",
          });
        });

      $("#nome_update").val("");
      $("#cpf_update").val("");
      $("#dataNascimento_update").val("");
      $("#email_update").val("");
    });
  }

  deleteEmployees() {
    const self = this;

    $(document).on("click", ".delete-btn", async function (e) {
      e.preventDefault();

      const employeeId = $(this).attr("data-id");
      const swalResponse = await Swal.fire({
        icon: "warning",
        title: "Tem certeza?",
        text: "Você está prestes a excluir este funcionário.",
        showCancelButton: true,
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar",
      });

      if (swalResponse.isConfirmed) {
        const apiUrl = `http://localhost:8080/api/employees/${employeeId}`;

        const requestOptions = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: employeeId,
          }),
        };

        fetch(apiUrl, requestOptions)
          .then((response) => {
            if (!response.ok) {
              return response.json().then((error) => Promise.reject(error));
            }
            return response.json();
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Funcionário excluído!",
              text: "O funcionário foi excluído com sucesso.",
            }).then((result) => {
              if (result.isConfirmed) location.reload();
            });
          })
          .catch((error) => {
            console.error("Erro ao fazer requisição:", error);
            Swal.fire({
              icon: "error",
              title: "Erro!",
              text:
                error.message ||
                "Erro ao excluir funcionário. Por favor, tente novamente.",
            });
          });
      }
    });
  }
}
